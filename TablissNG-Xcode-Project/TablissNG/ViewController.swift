import Cocoa
import SafariServices
import WebKit

let extensionBundleIdentifier = "com.bookcatkid.TablissNG.Extension"
let docsURL = URL(string: "https://bookcatkid.github.io/TablissNG/docs/getting-started/installation/safari")!

class ViewController: NSViewController, WKNavigationDelegate, WKScriptMessageHandler {

    @IBOutlet var webView: WKWebView!

    override func viewDidLoad() {
        super.viewDidLoad()

        webView.navigationDelegate = self
        webView.configuration.userContentController.add(self, name: "controller")
        webView.loadFileURL(Bundle.main.url(forResource: "Main", withExtension: "html")!, allowingReadAccessTo: Bundle.main.resourceURL!)
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        switch message.body as! String {
        case "open-preferences":
            SFSafariApplication.showPreferencesForExtension(withIdentifier: extensionBundleIdentifier) { error in
                if error == nil {
                    DispatchQueue.main.async {
                        NSApplication.shared.terminate(nil)
                    }
                }
            }
        case "open-docs":
            NSWorkspace.shared.open(docsURL)
            NSApplication.shared.terminate(nil)
        default:
            break
        }
    }

}
