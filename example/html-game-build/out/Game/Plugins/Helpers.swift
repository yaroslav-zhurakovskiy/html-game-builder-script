func convertToTypedValues<M: RawRepresentable, A: RawRepresentable> (
    method: String,
    arguments: [String: Any]
) -> (method: M, input: [A: String])? where M.RawValue == String, A.RawValue == String {
    guard let methodInput = M.init(rawValue: method) else {
        return nil
    }
    
    let argsInput: [A: String] = typedArguments(from: arguments)
    return (methodInput, argsInput)
}

func typedArguments<T: RawRepresentable>(
    from args: [String: Any]
) -> [T: String] where T.RawValue == String {
    var input: [T: String] = [:]
    
    for (argName, argValue) in args {
        if let argument = T.init(rawValue: argName) {
            guard let string = argValue as? String else {
                continue
            }
            
            input[argument] = string
        }
    }
    
    return input
}
    
