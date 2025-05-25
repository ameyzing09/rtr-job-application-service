const HTTP_ERRORS = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INVALID_TOKEN: 412,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

const HTTP_SUCCESS = {
  SUCCESS: 200,
  CREATED: 201
};

const ERROR_MESSAGES = {
  INVALID_REQUEST: {
    code: 'INVALID_REQUEST',
    message: 'Invalid Request'
  },
  BAD_REQUEST: {
    code: 'BAD_REQUEST',
    message: 'Bad Request'
  },
  INVALID_LIMIT: {
    code: 'INVALID_LIMIT',
    message: 'Invalid Limit'
  },
  INVALID_PAGE: {
    code: 'INVALID_PAGE',
    message: 'Invalid Page'
  },
  INTERNAL_SERVER_ERROR: {
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Internal server error'
  },
  INVALID_CREDENTIALS: {
    code: "INVALID_CREDENTIALS",
    message: "Invalid credentials"
  },
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    message: 'Unauthorized',
  },
  NOT_FOUND: {
    code: 'NOT_FOUND',
    message: 'Not found'
  },
  USER_NOT_FOUND: {
    code: "USER_NOT_FOUND",
    message: "User not found"
  },
  USER_ALREADY_EXISTS: {
    code: "USER_ALREADY_EXISTS",
    message: "User already exists"
  },
  CANDIDATE_NOT_FOUND: {
    code: "CANDIDATE_NOT_FOUND",
    message: "Candidate not found"
  },
  CANDIDATE_ALREADY_EXISTS: {
    code: "CANDIDATE_ALREADY_EXISTS",
    message: "Candidate already exists"
  },
  CANDIDATE_DOES_NOT_EXISTS: {
    code: "CANDIDATE_DOES_NOT_EXISTS",
    message: "Candidate does not exists"
  },
  FAILED_TO_CREATE_CANDIDATE: {
    code: "FAILED_TO_CREATE_CANDIDATE",
    message: "Failed to create candidate"
  },
  FAILED_TO_FETCH_CANDIDATE_DETAILS: {
    code: "FAILED_TO_FETCH_CANDIDATE_DETAILS",
    message: "Failed to fetch candidate details"
  },
  FAILED_TO_UPDATE_CANDIDATE_DETAILS: {
    code: "FAILED_TO_UPDATE_CANDIDATE_DETAILS",
    message: "Failed to update candidate details"
  },
};

const SUCCESS_MESSAGES = {
  USER_CREATED: {
    code: 'USER_CREATED',
    message: 'User created'
  }
};

export { HTTP_ERRORS, HTTP_SUCCESS, ERROR_MESSAGES, SUCCESS_MESSAGES };
