class ApiException extends Error {

    private readonly httpStatus: number;

    constructor(message: string, httpStatus: number){
        super(message);

        this.httpStatus = httpStatus;
        this.name = this.constructor.name;
        
        Object.setPrototypeOf(this, ApiException.prototype);
        
        Error.captureStackTrace(this, this.constructor);
    }

    get getMessage(): string{
        return super.message;
    }

    get getHttpStatus(): number{
        return this.httpStatus;
    }
}

export default ApiException;