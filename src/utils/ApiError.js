class ApiError extends Error{
//Coustmizng the error or setting the error accroding to us
constructor(
    statuscode,
    message='something went wrong',
    stack='',
    errors=[]
    )
    {
        super(message)
        this.statuscode = statuscode
        this.message = message
        this.success = false
        this.errors = errors
        this.data= null

        if(stack)
        this.stack = stack
        else
        Error.captureStackTrace(this, this.constructor)
    } 
    
}

export {ApiError}