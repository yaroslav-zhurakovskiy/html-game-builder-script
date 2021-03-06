import Foundation

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

func extractCallbacks(fromArguments args: [String: Any]) -> [Callback: String] {
    var result: [Callback: String] = [:]
    
    for callback in Callback.allCases {
        if let value = args[callback.rawValue] as? String {
            result[callback] = value
        }
    }
    
    return result
}

func extractCallbacksObjc(fromArguments args: [String: Any]) -> [String: String] {
    var result: [String: String] = [:]
    
    for (key, value) in extractCallbacks(fromArguments: args) {
        result[key.rawValue] = value
    }
    
    return result
}


@objc(SandboxBannerPlacement) enum BannerPlacement: Int {
    case top
    case bottom
}
