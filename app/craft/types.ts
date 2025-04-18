export type CraftStation = {
  /** id of the station */
  id: string;
  /** title of the station */
  title: string;
  /** tags of the station */
  tags: string[];
  /** description of the station */
  description: string;
  /** codes */
  codes: { [filename: string]: string };
};
