import UIKit

class GameContainer: UIViewController {
    @IBOutlet private weak var backButton: UIButton!
    
    private let objectName: String = sandboxAdObjectSystemName
    private let methodName: String = "showInterstitial"
    
    private let webGameControllerDelegateImpl: WebGameControllerDelegateImpl
    private let webGameController: WebGameController
    private let timer: GameTimer
    
    init() {
        webGameControllerDelegateImpl = WebGameControllerDelegateImpl()
        webGameController = {
            let rootURL = Bundle.main.bundleURL.appendingPathComponent("html-game")
            let controller = WebGameController(rootURL: rootURL, startingPage: "index.html")
            return controller
        }()
        timer = GameTimer(webGameController: webGameController)
        super.init(nibName: nil, bundle: nil)
    }
    
    required init?(coder: NSCoder) {
        fatalError()
    }
    
    var isBackButtonHiden: Bool {
        get { backButton.isHidden }
        set { backButton.isHidden = newValue }
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        webGameController.delegate = webGameControllerDelegateImpl
        webGameController.view.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        webGameController.view.frame = view.bounds
        view.insertSubview(webGameController.view, belowSubview: backButton)
        addChild(webGameController)
        
//        webGameController.request(SandboxObjectRequest(
//            object: objectName,
//            method: methodName,
//            arguments: [:]
//        ))
//        
//        timer.start()
    }
    
    @IBAction private func procesBack() {
        navigationController?.popViewController(animated: true)
    }
}
