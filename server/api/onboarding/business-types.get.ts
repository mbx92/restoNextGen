import { getBusinessTypesList } from "~/server/config/business-types";

export default defineEventHandler(() => {
  return {
    businessTypes: getBusinessTypesList(),
  };
});
