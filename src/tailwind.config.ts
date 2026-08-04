import { Config } from "tailwindcss";
import figmaTokens from "../assets/js/tokens";
import defaultTheme from "tailwindcss/defaultConfig";

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
      },
    },
  },
  content: [],
} satisfies Config;

export default railTechUITheme;
