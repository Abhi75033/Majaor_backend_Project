class ApiResponse{
    constructor(statuscode,data,message='success'){
        this.data = data
        this.statuscode = statuscode < 400
        this.message= message
    }
}

export {ApiResponse}