import ReactGA from "react-ga4";

const TRACKING_ID = "G-BGJ4ZEG78L";
ReactGA.initialize(TRACKING_ID, { debug: true });

export const trackPageView = (pagePath) => {
  ReactGA.send({ hitType: "pageview", page: pagePath });
};
