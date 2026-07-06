import { flatten } from "src/util/array";

/**
 * Takes a list of positions, and spreads them out,
 * so that no two elements end up closer than minSpaceBetweenElems
 * and the distance that each element is deflected is minimized.
 * It assumes the incoming elements are sorted by their position
 * (though duplicate positions in the input are allowed)
 * It returns the elements in the same order, now strictly sorted by their new position.
 *
 *
 * # The Algorithm
 *
 * Some elements are "anchor"s, which don't move,
 * and elements are deflected up or down until each element is far enough away.
 * The set of elements that needs to be deflected around an anchor makes a "group".
 *
 * For each element, we assume it could be an anchor,
 * and then create the group that would be around it.
 * We then choose the set of anchors/groups that includes each element once,
 * and that has the lowest possible "cost".
 *
 * To choose the best set of groups, imagine a directed acyclic graph (DAG)
 * where each group connects to the groups that could immediately precede it,
 * while not skipping or duplicating any trains between the groups.
 * Then find the shortest path through this DAG,
 * where the cost of each node is its "cost".
 * We never actually construct the whole DAG,
 * since we compute the best lowest cost path to each node as we go,
 * and we store that path instead of storing the whole DAG,
 * but imagining the DAG and the shortest path algorithm helps understand the algorithm.
 *
 * Wikipedia has a short description of this shortest path algorithm:
 * <https://en.wikipedia.org/wiki/Directed_acyclic_graph#Path_algorithms>
 *
 * Once we have the shortest path through the DAG of groups,
 * we concatenate the chosen groups together.
 *
 *
 * # Cost
 *
 * Each element gets a "cost" representing how bad its deflection was,
 * and it's this cost (summed over all elements) that is minimized.
 *
 * Currently, the cost of each element is its deflection squared.
 * This discourages long deflections, while allowing small deflections.
 *
 * It could be adjusted in the future to gently encourage/discourage behavior like
 *
 *   - Discourage deflecting an element past a particular point (e.g. the top or bottom of the screen)
 *   - Prefer deflecting up instead of down.
 *
 * The cost must be able to be calculated for a single element,
 * rather than calculating the cost for a whole arrangement,
 * so that the costs can be added together and costs for a groups can be compared effectively.
 * (It may be possible to use a slightly different concept of cost
 * where the cost is calculated per group instead of per element,
 * and still be able to compare groups effectively.)
 *
 *
 * # Limitations:
 *
 * Each group requires an anchor. This means that the algorithm potentially misses some solutions
 * which would have a lower cost, but require deflecting every element a small amount.
 * For example, if the input has two elements on top of each other,
 * it will deflect one element minSpaceBetweenElems, instead of deflecting each element halfway.
 * The algorithm can still always find a pretty good solution, though.
 *
 *
 * # As applied to ladder:
 *
 * This file is generalized so its easier to test with fake payloads.
 * As it's used, the dots on the track in the ladder are the starting point.
 * The labels are the ending point, and the labels must be far enough apart to not overlap.
 * For readability, we want to make sure that a label stays as close as possible to its dot.
 *
 *
 * # Algorithmic complexity:
 *
 * This algorithm has not been optimized.
 * It uses O(n^2) time and memory, but could use O(n^3/2) time and O(n) memory.
 * In the event that there's trouble rendering fast enough,
 * and profiling indicates that this algorithm is the problem,
 * here are some ideas on how to improve that.
 * But there are probably easier ways to speed up rendering,
 * like running the algorithm only when the data updates, instead of on every view.
 *
 * Constructing each group requires O(n^2) time,
 * Because each group must walk through all its members,
 * And in the worst case where the elements are so close that every group contains every element,
 * Each of the n groups must walk through n members.
 * It's possible you could do something clever to calculate this faster,
 * but you'd have to be clever,
 *
 * Finding the best path through the groups requires O(n^2) time,
 * because when we calculate potential previous groups, we check every previous group.
 * It is possible that this could be sped up by checking fewer potential previous groups.
 * Finding a best path through a DAG hypothetically takes O(V+E) time,
 * and we have O(n) vertices and could potentially have up to O(n^3/2) edges.
 *
 * Each of the n groups uses O(n) memory to store its entire list of members.
 * But many groups aren't used in the end result.
 * We could instead make each group use constant memory and avoid creating all those lists we don't use
 * by using the first/last index to reconstruct the data we need at the end,
 *
 * BestPathToGroup includes a list of all previous groups in its path.
 * If we instead stored the index of only the one immediately previous group,
 * we could recreate the path while only needing a constant amount of data per group.
 *
 */

export interface Start<T> {
  start: number;
  payload: T;
}

export interface End<T> {
  start: number;
  end: number;
  payload: T;
}

export const avoidOverlaps = <T>(
  items: Start<T>[],
  minSpaceBetweenElems: number,
): End<T>[] => {
  // If each element was an anchor, what would its group be
  const groups: Group<T>[] = items.map((anchorElem, index, allElems) =>
    groupAroundAnchor(anchorElem, index, allElems, minSpaceBetweenElems),
  );
  // get the best path through the groups, that goes all the way to the bottom
  const bestPaths: BestPathToGroup<T>[] = bestPathsToGroups(
    groups,
    minSpaceBetweenElems,
  );
  const bestPath: BestPathToGroup<T> | null = bestPathToBottom(bestPaths);
  return bestPath === null
    ? []
    : flatten(bestPath.path.map((group) => group.adjustedMembers));
};

type px = number;

type cost = number;

const costToDeflect = (start: px, end: px): cost =>
  (end - start) * (end - start);

/**
 * All the elements that need to be deflected around an anchor
 */
interface Group<T> {
  firstIndexInGroup: number;
  lastIndexInGroup: number;
  topEndPx: px;
  bottomEndPx: px;
  cost: cost;
  // ordered top to bottom
  adjustedMembers: End<T>[];
}

const groupAroundAnchor = <T>(
  anchorElem: Start<T>,
  anchorIndex: number,
  allElems: Start<T>[],
  minSpaceBetweenElems: px,
): Group<T> => {
  // start with a singleton group, where the anchor is alone and doesn't deflect
  const result: Group<T> = {
    firstIndexInGroup: anchorIndex,
    lastIndexInGroup: anchorIndex,
    topEndPx: anchorElem.start,
    bottomEndPx: anchorElem.start,
    cost: 0,
    adjustedMembers: [{ ...anchorElem, end: anchorElem.start }],
  };
  // expand up until we stop needing to deflect other elements
  for (let i = anchorIndex - 1; i >= 0; i--) {
    const nextElem = allElems[i];
    const closestAllowedEnd = result.topEndPx - minSpaceBetweenElems;
    if (nextElem.start > closestAllowedEnd) {
      // elem is too close, deflect it up and add it too group
      const deflectedElem: End<T> = { ...nextElem, end: closestAllowedEnd };
      result.firstIndexInGroup = i;
      result.topEndPx = closestAllowedEnd;
      result.adjustedMembers.push(deflectedElem);
      result.cost += costToDeflect(deflectedElem.start, deflectedElem.end);
    } else {
      // elem is far enough away, we can stop growing the group
      break;
    }
  }
  // we added elems bottom to top, so flip them now.
  result.adjustedMembers.reverse();
  // expand down
  for (let i = anchorIndex + 1; i < allElems.length; i++) {
    const nextElem = allElems[i];
    const closestAllowedEnd = result.bottomEndPx + minSpaceBetweenElems;
    if (nextElem.start < closestAllowedEnd) {
      // elem is too close, deflect it down and add it too group
      const deflectedElem: End<T> = { ...nextElem, end: closestAllowedEnd };
      result.lastIndexInGroup = i;
      result.bottomEndPx = closestAllowedEnd;
      result.adjustedMembers.push(deflectedElem);
      result.cost += costToDeflect(deflectedElem.start, deflectedElem.end);
    } else {
      // elem is far enough away, we can stop growing the group
      break;
    }
  }
  return result;
};

/**
 * For a group, what's the best way to choose the groups above so that this group is used.
 * And what's the total cost to reach and include this group.
 * The path should include every element up to this group exactly once.
 */
interface BestPathToGroup<T> {
  // total cost of all groups up to this one
  cost: cost;
  // all previous groups, sorted from top (first) to bottom (the group immediately before the target group)
  path: Group<T>[];
  group: Group<T>;
}

/**
 * Maps each group to the best path through the previous groups to reach it
 */
const bestPathsToGroups = <T>(
  groups: Group<T>[],
  minSpaceBetweenElems: px,
): BestPathToGroup<T>[] => {
  const bestPaths: BestPathToGroup<T>[] = [];
  // use .forEach() instead of .map() because we need to reference the growing list as we make it.
  groups.forEach((group) => {
    let bestPrevPath: BestPathToGroup<T> | null = null;
    for (let i = 0; i < group.firstIndexInGroup; i++) {
      const potentialPrevPath: BestPathToGroup<T> = bestPaths[i];
      if (
        // check that there's no duplicated or missing elems
        // between the previous group and this one
        potentialPrevPath.group.lastIndexInGroup + 1 ===
          group.firstIndexInGroup &&
        // If previous group overlaps with this one, it can't be used
        potentialPrevPath.group.bottomEndPx + minSpaceBetweenElems <=
          group.topEndPx
      ) {
        // potentialPrevPath.group is allowed to be immediately before this group.
        // check if it's the best path we've found so far.
        if (
          bestPrevPath === null ||
          bestPrevPath.cost > potentialPrevPath.cost
        ) {
          bestPrevPath = potentialPrevPath;
        }
      }
    }
    if (bestPrevPath === null) {
      // There's no groups that can come before this one, so this must be a top group.
      // Proof that we only reach this code for groups that contain the top train:
      // If group.firstIndex > 0, then the prevGroup anchored at group.firstIndex - 1 never overlaps,
      // so at the very least that prevGroup could be set as bestPrevPath.
      const path: BestPathToGroup<T> = {
        cost: group.cost,
        path: [group],
        group: group,
      };
      bestPaths.push(path);
    } else {
      // add this group to bestPrevPath
      const path: BestPathToGroup<T> = {
        cost: bestPrevPath.cost + group.cost,
        path: [...bestPrevPath.path, group],
        group: group,
      };
      bestPaths.push(path);
    }
  });
  return bestPaths;
};

/**
 * Given a list of best paths to each potential anchor,
 * chooses the best path that makes it all the way to the bottom.
 * Returns null if there are no paths that go all the way to the end. i.e. there are no trains.
 */
const bestPathToBottom = <T>(
  bestPaths: BestPathToGroup<T>[],
): BestPathToGroup<T> | null => {
  let result: BestPathToGroup<T> | null = null;
  bestPaths.forEach((path) => {
    if (path.group.lastIndexInGroup === bestPaths.length - 1) {
      // this path goes all the way to the bottom
      if (result === null || result.cost >= path.cost) {
        result = path;
      }
    }
  });
  return result;
};
