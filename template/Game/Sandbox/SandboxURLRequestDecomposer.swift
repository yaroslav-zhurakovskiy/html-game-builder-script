import Foundation

struct SandboxObjectRequest {
    let object: String
    let method: String?
    let arguments: [String: String]
}

class SandboxURLRequestDecomposer {
    func isSandboxRequest(_ request: URLRequest) -> Bool {
        guard let url = request.url, let schema = url.scheme else {
            return false
        }
        
        return schema == "sandbox"
    }
    
    func decomposeRequest(_ request: URLRequest) -> SandboxObjectRequest? {
        guard let url = request.url else {
            return nil
        }
        
        guard let (object, method) = extractObjectAndMethodNames(from: url) else {
            return nil
        }
        
        return SandboxObjectRequest(
            object: object,
            method: method,
            arguments: extractArguments(from: url)
        )
    }
    
    private func extractObjectAndMethodNames(from url: URL) -> (object: String, method: String?)? {
        guard let object = url.host else {
            return nil
        }
        
        let method = extractMethod(from: url)
        return (object, method)
    }
    
    private func extractMethod(from url: URL) -> String? {
        guard url.path.count > 1 && url.path.starts(with: "/") else {
            return nil
        }
        
        return String(url.path.dropFirst())
    }
    
    private func extractArguments(from url: URL) -> [String: String] {
        guard let query = url.query else {
            return [:]
        }
        
        var result: [String: String] = [:]
        
        for pair in query.split(separator: "&") {
            let argument = pair.split(separator: "=")
            
            let name = String(argument[0])
            let value = String(argument[1])
            result[name] = value
        }
        
        return result
    }
}
