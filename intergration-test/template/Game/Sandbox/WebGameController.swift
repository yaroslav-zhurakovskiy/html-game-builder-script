import UIKit

protocol WebGameControllerDelegate: class {
    func webGameWilLoad(_ controller: WebGameController)
    func webGameConroller(_ controller: WebGameController, didReceiveRequest: SandboxObjectRequest)
}

class WebGameController: UIViewController {
    @IBOutlet weak var webView: UIWebView!
    
    private let rootURL: URL
    private let startingPage: String
    private let decompser = SandboxURLRequestDecomposer()
    
    weak var delegate: WebGameControllerDelegate?
    
    init(rootURL: URL, startingPage: String) {
        self.rootURL = rootURL
        self.startingPage = startingPage
        super.init(nibName: nil, bundle: nil)
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        webView.delegate = self
        
        delegate?.webGameWilLoad(self)
        
        let indexHTML = rootURL.appendingPathComponent(startingPage)
        let content = try! String(contentsOf: indexHTML)
        webView.loadHTMLString(content, baseURL: rootURL)
    }
}

extension WebGameController: UIWebViewDelegate {
    
    
    func webView(_ webView: UIWebView, didFailLoadWithError error: Error) {
        print(error)
    }
    
    func webViewDidStartLoad(_ webView: UIWebView) {
        
    }
    
    func webViewDidFinishLoad(_ webView: UIWebView) {
        
    }
    
    func webView(
        _ webView: UIWebView,
        shouldStartLoadWith request: URLRequest,
        navigationType: UIWebView.NavigationType
    ) -> Bool {
        
        guard decompser.isSandboxRequest(request) else {
            return true
        }
        
        if let request = decompser.decomposeRequest(request) {
            delegate?.webGameConroller(self, didReceiveRequest: request)
        }
        
        return false
    }
}

extension WebGameController {
    @discardableResult
    func notifyObservers(withEvent event: String, data: Any?) -> String? {
        let params = buildParams(withEvent: event, data: data)
        let code = "window.GlobalSandboxBridgeNotificationCenter.notify(\(params))"
        return webView.stringByEvaluatingJavaScript(from: code)
    }
    
    private func buildParams(withEvent event: String, data: Any?) -> String {
        guard
            let data = data,
            let jsonData = try? JSONSerialization.data(withJSONObject: data, options: []),
            let jsonString = String(data: jsonData, encoding: .utf8)
        else {
            return "\(event)"
        }
        
        return "\(event), \(jsonString)"
    }
}
