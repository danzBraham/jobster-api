import CustomAPIError from "./custom-error.js";
import { StatusCodes } from "http-status-codes";

export default class UnauthenticatedError extends CustomAPIError {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.UNAUTHORIZED;
  }
}
