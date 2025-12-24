interface IResponse {
  success: boolean;
  message: string;
}

class GoogleSheetsResponse<T> implements IResponse{

    public success: boolean;
    public message: string;
    private data?: T;
    private location?: string;
    private range?: string;
    private error?: string;

    constructor(success: boolean, message: string, data: any){
        this.success = success;
        this.message = message;
        this.data = data;
    }

    // Getters e Setters

    public get getSuccess(): boolean { return this.success; }

    public get getMessage(): string { return this.message; }

    public get getData(): T | undefined { return this.data; }

    public get getLocation(): string | undefined { return this.location; }
    public setLocation(location: string): this { 
        this.location = location; 
        return this; 
    }

    public get getRange(): string | undefined { return this.range; }
    public setRange(range: string): this {
        this.range = range;
        return this;
    }

    public get getError(): string | undefined { return this.error; }
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

    // CONVERTE PARA OBJETO SIMPLES
    public toJSON(): object {
        return {
            success: this.success,
            message: this.message,
            data: this.data,
            location: this.location,
            range: this.range,
            error: this.error
        };
    }
}

export default GoogleSheetsResponse;