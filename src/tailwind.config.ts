import { Config } from "tailwindcss";
import figmaTokens from "../assets/js/tokens";
import defaultTheme from "tailwindcss/defaultTheme";

const {
  customColors,
  // do not export tailwindColors so as not to clash with native Tailwind colors
} = figmaTokens;

const railTechUITheme = {
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
      },
      fontSize: {
        xs: figmaTokens.xs.regular,
        sm: figmaTokens.sm.regular,
        base: figmaTokens.base.regular,
        md: figmaTokens.md.regular,
        lg: figmaTokens.lg.regular,
      },
      colors: {
        ...customColors,
        "light-rail": {
          "b-branch": figmaTokens.LightRail.B["b-branch"],
          "c-branch": figmaTokens.LightRail.C["c-branch"],
          "d-branch": figmaTokens.LightRail.D["d-branch"],
          "e-branch": figmaTokens.LightRail.E["e-branch"],
          "mattapan-branch": figmaTokens.LightRail.Mattapan["mattapan-branch"],
        },
        "heavy-rail": {
          braintree: figmaTokens.Orbit.braintree,
          ashmont: figmaTokens.Orbit.ashmont,
          "orange-line": figmaTokens.Orbit.orangeline,
          "blue-line": figmaTokens.Orbit.blueline,
        },
        "text-primary-light": figmaTokens.textPrimaryLight,
        "text-primary-dark": figmaTokens.textPrimaryDark,
        "text-secondary-light": figmaTokens.textSecondaryLight,
        "text-secondary-dark": figmaTokens.textSecondaryDark,
        "text-accent-light": figmaTokens.textAccentLight,
        "text-accent-dark": figmaTokens.textAccentDark,
        "error-state": {
          "warning-dark": figmaTokens.errorState["warning-dark"],
          "error-dark": figmaTokens.errorState["error-dark"],
          "warning-bg-dark": figmaTokens.errorState["warning-bg-dark"],
          "warning-light": figmaTokens.errorState["warning-light"],
          "error-light": figmaTokens.errorState["error-light"],
          "warning-bg-light": figmaTokens.errorState["warning-bg-light"],
        },
        "non-rev-light": figmaTokens.nonRevLight,
        "non-rev-dark": figmaTokens.nonRevDark,
        environment: {
          "dev-dark": figmaTokens.environment["env-dev-dark"],
          "dev-green-dark": figmaTokens.environment["env-dev-green-dark"],
          "dev-blue-dark": figmaTokens.environment["env-dev-blue-dark"],
          "dev-light": figmaTokens.environment["env-dev-light"],
          "dev-green-light": figmaTokens.environment["env-dev-green-light"],
          "dev-blue-light": figmaTokens.environment["env-dev-blue-light"],
        },
        "success-light": figmaTokens.successLight,
        "success-dark": figmaTokens.successDark,
        "arrivals-light": figmaTokens.arrivalsLight,
        "arrivals-dark": figmaTokens.arrivalsDark,
        "departures-light": figmaTokens.departuresLight,
        "departures-dark": figmaTokens.departuresDark,
        "icon-light": figmaTokens.iconLight,
        "icon-dark": figmaTokens.iconDark,
        menu: {
          "background-light": figmaTokens.menu["background-light"],
          button: {
            "default-light": figmaTokens.menu.button["default-light"],
            "active-light": figmaTokens.menu.button["active-light"],
            "hover-light": figmaTokens.menu.button["hover-light"],
            "default-dark": figmaTokens.menu.button["default-dark"],
            "active-dark": figmaTokens.menu.button["active-dark"],
            "hover-dark": figmaTokens.menu.button["hover-dark"],
          },
          "background-dark": figmaTokens.menu["background-dark"],
        },
        button: {
          primary: {
            "background-light": figmaTokens.button.primary["background-light"],
            "text-light": figmaTokens.button.primary["text-light"],
            "background-dark": figmaTokens.button.primary["background-dark"],
            "text-dark": figmaTokens.button.primary["text-dark"],
          },
          secondary: {
            "background-light":
              figmaTokens.button.secondary["background-light"],
            "text-light": figmaTokens.button.secondary["text-light"],
            "border-light": figmaTokens.button.secondary["border-light"],
            "background-dark": figmaTokens.button.secondary["background-dark"],
            "text-dark": figmaTokens.button.secondary["text-dark"],
            "border-dark": figmaTokens.button.secondary["border-dark"],
          },
          tertiary: {
            "background-light": figmaTokens.button.tertiary["background-light"],
            "text-light": figmaTokens.button.tertiary["text-light"],
            "border-light": figmaTokens.button.tertiary["border-light"],
            "background-dark": figmaTokens.button.tertiary["background-dark"],
            "text-dark": figmaTokens.button.tertiary["text-dark"],
            "border-dark": figmaTokens.button.tertiary["border-dark"],
          },
        },
        ladder: {
          "background-light": figmaTokens.ladder["background-light"],
          pill: {
            "background-light": figmaTokens.ladder.pill["background-light"],
            "border-light": figmaTokens.ladder.pill["border-light"],
            text: {
              "b-light": figmaTokens.ladder.pill.text["b-light"],
              "c-light": figmaTokens.ladder.pill.text["c-light"],
              "d-light": figmaTokens.ladder.pill.text["d-light"],
              "e-light": figmaTokens.ladder.pill.text["e-light"],
              "braintree-light":
                figmaTokens.ladder.pill.text["braintree-light"],
              "ashmont-light": figmaTokens.ladder.pill.text["ashmont-light"],
              "blueline-light": figmaTokens.ladder.pill.text["blueline-light"],
              "orangeline-light":
                figmaTokens.ladder.pill.text["orangeline-light"],
              "b-dark": figmaTokens.ladder.pill.text["b-dark"],
              "c-dark": figmaTokens.ladder.pill.text["c-dark"],
              "d-dark": figmaTokens.ladder.pill.text["d-dark"],
              "e-dark": figmaTokens.ladder.pill.text["e-dark"],
              "braintree-dark": figmaTokens.ladder.pill.text["braintree-dark"],
              "ashmont-dark": figmaTokens.ladder.pill.text["ashmont-dark"],
              "blueline-dark": figmaTokens.ladder.pill.text["blueline-dark"],
              "orangeline-dark":
                figmaTokens.ladder.pill.text["orangeline-dark"],
            },
            nonrev: {
              "border-light": figmaTokens.ladder.pill.nonrev["border-light"],
              "background-light":
                figmaTokens.ladder.pill.nonrev["background-light"],
              "text-light": figmaTokens.ladder.pill.nonrev["text-light"],
              "border-dark": figmaTokens.ladder.pill.nonrev["border-dark"],
              "background-dark":
                figmaTokens.ladder.pill.nonrev["background-dark"],
              "text-dark": figmaTokens.ladder.pill.nonrev["text-dark"],
            },
            "background-dark": figmaTokens.ladder.pill["background-dark"],
            "border-dark": figmaTokens.ladder.pill["border-dark"],
          },
          "route-ladder-light": figmaTokens.ladder["route-ladder-light"],
          text: {
            "primary-light": figmaTokens.ladder.text["primary-light"],
            "secondary-light": figmaTokens.ladder.text["secondary-light"],
            "unselected-branch-light":
              figmaTokens.ladder.text["unselected-branch-light"],
            "selected-branch-light":
              figmaTokens.ladder.text["selected-branch-light"],
            "primary-dark": figmaTokens.ladder.text["primary-dark"],
            "secondary-dark": figmaTokens.ladder.text["secondary-dark"],
            "unselected-branch-dark":
              figmaTokens.ladder.text["unselected-branch-dark"],
            "selected-branch-dark":
              figmaTokens.ladder.text["selected-branch-dark"],
          },
          "station-marker-light": figmaTokens.ladder["station-marker-light"],
          "branch-picker": {
            "inactive-bg-light":
              figmaTokens.ladder["branch-picker"]["inactive-bg-light"],
            "active-bg-light":
              figmaTokens.ladder["branch-picker"]["active-bg-light"],
            "alewife-dot-light":
              figmaTokens.ladder["branch-picker"]["alewife-dot-light"],
            "active-dot-light":
              figmaTokens.ladder["branch-picker"]["active-dot-light"],
            "inactive-bg-dark":
              figmaTokens.ladder["branch-picker"]["inactive-bg-dark"],
            "active-bg-dark":
              figmaTokens.ladder["branch-picker"]["active-bg-dark"],
            "alewife-dot-dark":
              figmaTokens.ladder["branch-picker"]["alewife-dot-dark"],
            "active-dot-dark":
              figmaTokens.ladder["branch-picker"]["active-dot-dark"],
          },
          "background-dark": figmaTokens.ladder["background-dark"],
          "route-ladder-dark": figmaTokens.ladder["route-ladder-dark"],
          "station-marker-dark": figmaTokens.ladder["station-marker-dark"],
        },
        trainsheet: {
          "background-light": figmaTokens.trainsheet["background-light"],
          "now-zone": {
            "background-light":
              figmaTokens.trainsheet["now-zone"]["background-light"],
            "border-light": figmaTokens.trainsheet["now-zone"]["border-light"],
            "background-dark":
              figmaTokens.trainsheet["now-zone"]["background-dark"],
            "border-dark": figmaTokens.trainsheet["now-zone"]["border-dark"],
          },
          "background-dark": figmaTokens.trainsheet["background-dark"],
        },
        drawer: {
          "background-light": figmaTokens.drawer["background-light"],
          "border-light": figmaTokens.drawer["border-light"],
          "exit-icon-light": figmaTokens.drawer["exit-icon-light"],
          "background-dark": figmaTokens.drawer["background-dark"],
          "border-dark": figmaTokens.drawer["border-dark"],
          "exit-icon-dark": figmaTokens.drawer["exit-icon-dark"],
        },
        card: {
          "background-light": figmaTokens.card["background-light"],
          "border-light": figmaTokens.card["border-light"],
          "header-light": figmaTokens.card["header-light"],
          "background-dark": figmaTokens.card["background-dark"],
          "border-dark": figmaTokens.card["border-dark"],
          "header-dark": figmaTokens.card["header-dark"],
        },
        inputField: {
          search: {
            "background-light":
              figmaTokens.inputField.search["background-light"],
            "border-light": figmaTokens.inputField.search["border-light"],
            text: {
              "type-in-light":
                figmaTokens.inputField.search.text["type-in-light"],
              "placeholder-light":
                figmaTokens.inputField.search.text["placeholder-light"],
              "type-in-dark":
                figmaTokens.inputField.search.text["type-in-dark"],
              "placeholder-dark":
                figmaTokens.inputField.search.text["placeholder-dark"],
            },
            "background-dark": figmaTokens.inputField.search["background-dark"],
            "border-dark": figmaTokens.inputField.search["border-dark"],
          },
        },
        popup: {
          "background-light": figmaTokens.popup["background-light"],
          "background-dark": figmaTokens.popup["background-dark"],
        },
      },
    },
  },
  content: [],
} satisfies Config;

export default railTechUITheme;
