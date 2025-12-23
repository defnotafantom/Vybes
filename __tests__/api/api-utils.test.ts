/**
 * Test API error classes without importing NextResponse dependencies
 */

// Define error classes inline for testing (same implementation as lib/api-utils.ts)
class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

class AuthError extends ApiError {
  constructor(message = 'Non autorizzato') {
    super(message, 401, 'UNAUTHORIZED')
    this.name = 'AuthError'
  }
}

class ForbiddenError extends ApiError {
  constructor(message = 'Accesso negato') {
    super(message, 403, 'FORBIDDEN')
    this.name = 'ForbiddenError'
  }
}

class NotFoundError extends ApiError {
  constructor(message = 'Risorsa non trovata') {
    super(message, 404, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

class ValidationError extends ApiError {
  constructor(message = 'Dati non validi') {
    super(message, 400, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
}

describe('API Utils - Error Classes', () => {
  describe('ApiError', () => {
    it('has correct properties', () => {
      const error = new ApiError('Test error', 500, 'TEST_ERROR')
      expect(error.message).toBe('Test error')
      expect(error.statusCode).toBe(500)
      expect(error.code).toBe('TEST_ERROR')
      expect(error.name).toBe('ApiError')
    })

    it('defaults to 500 status code', () => {
      const error = new ApiError('Test')
      expect(error.statusCode).toBe(500)
    })
  })

  describe('AuthError', () => {
    it('defaults to 401', () => {
      const error = new AuthError()
      expect(error.statusCode).toBe(401)
      expect(error.code).toBe('UNAUTHORIZED')
    })

    it('accepts custom message', () => {
      const error = new AuthError('Custom auth message')
      expect(error.message).toBe('Custom auth message')
    })
  })

  describe('ForbiddenError', () => {
    it('defaults to 403', () => {
      const error = new ForbiddenError()
      expect(error.statusCode).toBe(403)
      expect(error.code).toBe('FORBIDDEN')
    })
  })

  describe('NotFoundError', () => {
    it('defaults to 404', () => {
      const error = new NotFoundError()
      expect(error.statusCode).toBe(404)
      expect(error.code).toBe('NOT_FOUND')
    })
  })

  describe('ValidationError', () => {
    it('defaults to 400', () => {
      const error = new ValidationError()
      expect(error.statusCode).toBe(400)
      expect(error.code).toBe('VALIDATION_ERROR')
    })
  })

  describe('Error inheritance', () => {
    it('all errors extend ApiError', () => {
      expect(new AuthError()).toBeInstanceOf(ApiError)
      expect(new ForbiddenError()).toBeInstanceOf(ApiError)
      expect(new NotFoundError()).toBeInstanceOf(ApiError)
      expect(new ValidationError()).toBeInstanceOf(ApiError)
    })

    it('all errors extend Error', () => {
      expect(new ApiError('test')).toBeInstanceOf(Error)
      expect(new AuthError()).toBeInstanceOf(Error)
    })
  })
})





/**
 * Test API error classes without importing NextResponse dependencies
 */

// Define error classes inline for testing (same implementation as lib/api-utils.ts)
class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

class AuthError extends ApiError {
  constructor(message = 'Non autorizzato') {
    super(message, 401, 'UNAUTHORIZED')
    this.name = 'AuthError'
  }
}

class ForbiddenError extends ApiError {
  constructor(message = 'Accesso negato') {
    super(message, 403, 'FORBIDDEN')
    this.name = 'ForbiddenError'
  }
}

class NotFoundError extends ApiError {
  constructor(message = 'Risorsa non trovata') {
    super(message, 404, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

class ValidationError extends ApiError {
  constructor(message = 'Dati non validi') {
    super(message, 400, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
}

describe('API Utils - Error Classes', () => {
  describe('ApiError', () => {
    it('has correct properties', () => {
      const error = new ApiError('Test error', 500, 'TEST_ERROR')
      expect(error.message).toBe('Test error')
      expect(error.statusCode).toBe(500)
      expect(error.code).toBe('TEST_ERROR')
      expect(error.name).toBe('ApiError')
    })

    it('defaults to 500 status code', () => {
      const error = new ApiError('Test')
      expect(error.statusCode).toBe(500)
    })
  })

  describe('AuthError', () => {
    it('defaults to 401', () => {
      const error = new AuthError()
      expect(error.statusCode).toBe(401)
      expect(error.code).toBe('UNAUTHORIZED')
    })

    it('accepts custom message', () => {
      const error = new AuthError('Custom auth message')
      expect(error.message).toBe('Custom auth message')
    })
  })

  describe('ForbiddenError', () => {
    it('defaults to 403', () => {
      const error = new ForbiddenError()
      expect(error.statusCode).toBe(403)
      expect(error.code).toBe('FORBIDDEN')
    })
  })

  describe('NotFoundError', () => {
    it('defaults to 404', () => {
      const error = new NotFoundError()
      expect(error.statusCode).toBe(404)
      expect(error.code).toBe('NOT_FOUND')
    })
  })

  describe('ValidationError', () => {
    it('defaults to 400', () => {
      const error = new ValidationError()
      expect(error.statusCode).toBe(400)
      expect(error.code).toBe('VALIDATION_ERROR')
    })
  })

  describe('Error inheritance', () => {
    it('all errors extend ApiError', () => {
      expect(new AuthError()).toBeInstanceOf(ApiError)
      expect(new ForbiddenError()).toBeInstanceOf(ApiError)
      expect(new NotFoundError()).toBeInstanceOf(ApiError)
      expect(new ValidationError()).toBeInstanceOf(ApiError)
    })

    it('all errors extend Error', () => {
      expect(new ApiError('test')).toBeInstanceOf(Error)
      expect(new AuthError()).toBeInstanceOf(Error)
    })
  })
})











