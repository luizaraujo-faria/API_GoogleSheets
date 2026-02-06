interface IResponse {
  success: boolean;
  message: string;
}

class GoogleSheetsResponse<T> implements IResponse{

    public success: boolean;
    public message: string;
    private data?: T;
    private error?: string;

    constructor(success: boolean, message: string, data: any){
        this.success = success;
        this.message = message;
        this.data = data;
    }

    public setError(error: string): this {
        this.error = error;
        return this;
    }

    // MENSAGEM DE SUCESSO
    public static successMessage<T>(message: string, data: T): GoogleSheetsResponse<T>{
        return new GoogleSheetsResponse<T>(true, message, data);
    }

    // MENSAGEM DE ERRO
    public static errorMessage<T>(message: string, error?: string): GoogleSheetsResponse<T>{
        const errorResponse = new GoogleSheetsResponse<T>(false, message, null);
        if(error) errorResponse.setError(error);
        return errorResponse;
    }
}

export default GoogleSheetsResponse;