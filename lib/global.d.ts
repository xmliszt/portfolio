/* eslint-disable unused-imports/no-unused-vars */
import config from "@/velite.config";

declare global {
  type Page = (typeof config.collections)["pages"]["schema"]["_output"];
  type Focus = (typeof config.collections)["focus"]["schema"]["_output"];
}
