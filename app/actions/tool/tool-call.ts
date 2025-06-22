"use server";

import { dataActionWithPermission } from "@/lib/permission/guards/action";
import { wsApiCallWithDefaultParams } from "./ws-api-call";

export const toolCall = dataActionWithPermission("toolCall", wsApiCallWithDefaultParams);