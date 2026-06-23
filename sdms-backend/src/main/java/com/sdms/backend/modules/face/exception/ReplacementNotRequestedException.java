package com.sdms.backend.modules.face.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
public class ReplacementNotRequestedException extends RuntimeException {
    public ReplacementNotRequestedException(String message) {
        super(message);
    }
}
