package app.chordium;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.WebView;

import androidx.activity.OnBackPressedCallback;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.WebViewListener;

public class MainActivity extends BridgeActivity {
    private static final String APP_HOST = "chordium.vercel.app";
    private static final String LOCAL_ORIGIN = "https://localhost";

    private String pendingUrl;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // The app is a single-page React app, so the default back behaviour
        // would close it from anywhere. Follow the WebView history first and
        // only exit once the reader is back at the start.
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                WebView webView = getBridge().getWebView();
                if (webView.canGoBack()) {
                    webView.goBack();
                } else {
                    finish();
                }
            }
        });

        getBridge().addWebViewListener(new WebViewListener() {
            @Override
            public void onPageLoaded(WebView webView) {
                if (pendingUrl == null) {
                    return;
                }
                String url = pendingUrl;
                pendingUrl = null;
                webView.loadUrl(url);
            }
        });

        openSharedLink(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        openSharedLink(intent);
    }

    /**
     * Shared song links arrive as verified App Links. Capacitor does not route
     * the URL into the bundled web app by itself, so translate the public path
     * to the local origin and let the React router handle it.
     */
    private void openSharedLink(Intent intent) {
        if (intent == null || !Intent.ACTION_VIEW.equals(intent.getAction())) {
            return;
        }

        Uri data = intent.getData();
        if (data == null || !"https".equals(data.getScheme()) || !APP_HOST.equals(data.getHost())) {
            return;
        }

        String path = data.getPath();
        if (path == null || path.isEmpty()) {
            return;
        }

        String url = LOCAL_ORIGIN + path;
        if (data.getQuery() != null) {
            url += "?" + data.getQuery();
        }

        WebView webView = getBridge().getWebView();
        if (webView == null) {
            return;
        }

        if (webView.getUrl() == null) {
            pendingUrl = url;
            return;
        }

        final String targetUrl = url;
        webView.post(() -> webView.loadUrl(targetUrl));
    }
}
