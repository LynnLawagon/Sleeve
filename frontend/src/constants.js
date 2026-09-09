// Design tokens
// paper   warm paper background
// ink     near-black ink
// tape    cassette amber — primary accent
// vinyl   deep vinyl red — ratings / danger
// sage    muted green — wishlist / success
// line    hairline border
// panel   slightly darker paper, for cards
// muted   secondary text
export const C = {
  paper: "#EDE6D6",
  ink: "#201D18",
  tape: "#C98A2B",
  vinyl: "#9E3324",
  sage: "#5F6F52",
  line: "#CBC0A8",
  panel: "#E3DAC5",
  muted: "#8B8272",
  steel: "#AEB6B4",
};

export const FORMATS = ["Vinyl", "CD", "Cassette", "Other"];
export const PRIORITIES = ["Low", "Medium", "High"];

export const formatColor = (f) =>
  f === "Vinyl" ? C.vinyl : f === "Cassette" ? C.tape : f === "CD" ? "#5C6B72" : C.muted;
