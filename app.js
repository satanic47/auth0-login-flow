/**
 * Auth0 Modern Log-in Flow
 * Built for MLH Global Hack Week: Builders Week
 * Uses official @auth0/auth0-spa-js SDK
 */

// Default configuration from user's Auth0 tenant
const DEFAULT_CONFIG = {
  domain: "dev-ycggan14b30pol1n.eu.auth0.com",
  clientId: "HDpmLjuqijvLsBJuuhnoVRhMbsyygxfv"
};

let auth0Client = null;
let currentConfig = { ...DEFAULT_CONFIG };
let rawIdToken = null;

// Initialize App
async function initApp() {
  loadConfig();
  updateConfigModalUI();

  const redirectUri = window.location.origin + window.location.pathname;

  try {
    // 1. Create Auth0 Client
    auth0Client = await auth0.createAuth0Client({
      domain: currentConfig.domain,
      clientId: currentConfig.clientId,
      authorizationParams: {
        redirect_uri: redirectUri
      },
      cacheLocation: 'localstorage',
      useRefreshTokens: true
    });

    // 2. Handle OAuth Redirect Callback (if returning from Auth0 login)
    const query = window.location.search;
    if (query.includes("code=") && query.includes("state=")) {
      try {
        await auth0Client.handleRedirectCallback();
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (cbErr) {
        console.error("Callback resolution error:", cbErr);
      }
    }

    // 3. Update Authentication UI State
    await updateUI();

  } catch (err) {
    console.error("Auth0 initialization error:", err);
    document.getElementById("loadingView").innerHTML = `
      <div style="text-align: center; max-width: 480px;">
        <h3 style="color: #ff4757; margin-bottom: 0.5rem;">⚠️ Auth0 Initialization Error</h3>
        <p style="font-size: 0.85rem; color: #9aa3be; margin-bottom: 1rem;">${err.message || 'Unable to connect to Auth0 tenant.'}</p>
        <p style="font-size: 0.78rem; color: #5e6884;">Make sure <code>${window.location.origin}</code> is added to <strong>Allowed Web Origins</strong> in your Auth0 Application Settings.</p>
        <button onclick="openConfigModal()" class="btn-primary-sm" style="margin-top: 1rem;">Configure Tenant</button>
      </div>
    `;
    return;
  }

  // 4. Bind DOM Event Listeners
  bindEvents();
}

// Update UI based on auth state
async function updateUI() {
  const loadingView = document.getElementById("loadingView");
  const loggedOutView = document.getElementById("loggedOutView");
  const loggedInView = document.getElementById("loggedInView");
  const authNavContainer = document.getElementById("authNavContainer");

  const isAuthenticated = await auth0Client.isAuthenticated();

  loadingView.style.display = "none";

  if (isAuthenticated) {
    loggedOutView.style.display = "none";
    loggedInView.style.display = "block";

    const user = await auth0Client.getUser();
    const claims = await auth0Client.getIdTokenClaims();
    rawIdToken = claims?.__raw || "";

    // Header nav button
    authNavContainer.innerHTML = `
      <button id="btnNavLogout" class="btn-ghost" style="color: #ff4757;">Sign Out</button>
    `;
    document.getElementById("btnNavLogout")?.addEventListener("click", logout);

    // Profile Banner
    document.getElementById("userPicture").src = user.picture || "https://avatar.vercel.sh/" + (user.email || "user");
    document.getElementById("userName").innerText = user.name || user.nickname || "Auth0 User";
    document.getElementById("userEmail").innerText = user.email || "No public email";
    document.getElementById("userSub").innerText = user.sub || "";

    const verifiedBadge = document.getElementById("userVerifiedBadge");
    if (user.email_verified) {
      verifiedBadge.innerText = "✓ Email Verified";
      verifiedBadge.className = "badge-verified";
    } else {
      verifiedBadge.innerText = "Email Unverified";
      verifiedBadge.style.color = "#ffbe0b";
      verifiedBadge.style.borderColor = "rgba(255, 190, 11, 0.4)";
    }

    // Populate Claims Table
    const tableBody = document.getElementById("claimsTableBody");
    tableBody.innerHTML = "";
    const priorityKeys = ["name", "email", "email_verified", "nickname", "sub", "updated_at", "iss", "aud", "exp", "iat"];
    
    // Sort keys with priority first
    const allKeys = Object.keys(user).sort((a, b) => {
      const idxA = priorityKeys.indexOf(a);
      const idxB = priorityKeys.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });

    for (const key of allKeys) {
      const row = document.createElement("tr");
      let val = user[key];
      if (typeof val === "object") val = JSON.stringify(val);
      row.innerHTML = `
        <td class="claims-key">${escapeHtml(key)}</td>
        <td class="claims-val">${escapeHtml(String(val))}</td>
      `;
      tableBody.appendChild(row);
    }

    // Token JSON Viewer
    const cleanClaims = { ...claims };
    delete cleanClaims.__raw; // remove raw string from JSON tree
    document.getElementById("tokenJsonViewer").innerText = JSON.stringify(cleanClaims, null, 2);

  } else {
    loggedInView.style.display = "none";
    loggedOutView.style.display = "block";

    authNavContainer.innerHTML = `
      <button id="btnNavLogin" class="btn-primary-sm">Sign In</button>
    `;
    document.getElementById("btnNavLogin")?.addEventListener("click", loginRedirect);
  }
}

// Login Actions
async function loginRedirect() {
  try {
    const redirectUri = window.location.origin + window.location.pathname;
    await auth0Client.loginWithRedirect({
      authorizationParams: {
        redirect_uri: redirectUri
      }
    });
  } catch (err) {
    console.error("Login redirect error:", err);
    alert("Auth0 Login Error: " + err.message);
  }
}

async function loginPopup() {
  try {
    document.getElementById("loadingView").style.display = "flex";
    await auth0Client.loginWithPopup();
    await updateUI();
  } catch (err) {
    document.getElementById("loadingView").style.display = "none";
    console.error("Login popup error:", err);
    if (err.error !== "cancelled") {
      alert("Auth0 Popup Error: " + err.message);
    }
  }
}

// Logout Action
async function logout() {
  try {
    const returnTo = window.location.origin + window.location.pathname;
    await auth0Client.logout({
      logoutParams: {
        returnTo: returnTo
      }
    });
  } catch (err) {
    console.error("Logout error:", err);
  }
}

// Simulate Calling a Protected API using the Access Token
async function simulateProtectedApi() {
  const apiCard = document.getElementById("apiResultCard");
  const apiPre = document.getElementById("apiResponseContent");
  const badge = document.getElementById("apiStatusBadge");

  try {
    apiCard.style.display = "block";
    apiPre.innerText = "Acquiring access token silently from Auth0 session...";

    // Get token silently (PKCE flow)
    const token = await auth0Client.getTokenSilently();
    const user = await auth0Client.getUser();

    // Mock API payload response
    const mockApiResponse = {
      status: "success",
      statusCode: 200,
      timestamp: new Date().toISOString(),
      authorizedClient: currentConfig.clientId,
      authenticatedSubject: user.sub,
      grantedScopes: ["openid", "profile", "email"],
      bearerTokenSnippet: `${token.substring(0, 16)}...${token.substring(token.length - 12)}`,
      secretPayload: {
        accessLevel: "HACKATHON_PARTICIPANT_VERIFIED",
        message: "Protected resource successfully retrieved using Auth0 JWT Bearer Token!",
        sessionIntegrity: "Cryptographically Verified via RS256 Signature"
      }
    };

    badge.innerText = "HTTP 200 OK";
    badge.className = "badge-success";
    apiPre.innerText = JSON.stringify(mockApiResponse, null, 2);

  } catch (err) {
    badge.innerText = "HTTP 401 UNAUTHORIZED";
    badge.className = "badge-verified";
    badge.style.color = "#ff4757";
    apiPre.innerText = `Error contacting protected resource:\n${err.message}`;
  }
}

// Copy Raw Token
function copyRawToken() {
  if (!rawIdToken) return;
  navigator.clipboard.writeText(rawIdToken).then(() => {
    const btn = document.getElementById("btnCopyToken");
    const originalText = btn.innerText;
    btn.innerText = "✓ Copied to Clipboard!";
    setTimeout(() => {
      btn.innerText = originalText;
    }, 2000);
  });
}

// Config Management
function loadConfig() {
  const saved = localStorage.getItem("auth0_custom_config");
  if (saved) {
    try {
      currentConfig = JSON.parse(saved);
    } catch (e) {
      currentConfig = { ...DEFAULT_CONFIG };
    }
  } else {
    currentConfig = { ...DEFAULT_CONFIG };
  }
}

function updateConfigModalUI() {
  document.getElementById("cfgDomain").value = currentConfig.domain;
  document.getElementById("cfgClientId").value = currentConfig.clientId;
  const currentOrigin = window.location.origin + window.location.pathname;
  document.getElementById("currentOriginCode").innerText = currentOrigin;
}

function openConfigModal() {
  updateConfigModalUI();
  document.getElementById("configModal").style.display = "flex";
}

function closeConfigModal() {
  document.getElementById("configModal").style.display = "none";
}

function saveConfig() {
  const domain = document.getElementById("cfgDomain").value.trim();
  const clientId = document.getElementById("cfgClientId").value.trim();

  if (!domain || !clientId) {
    alert("Please provide both an Auth0 Domain and Client ID.");
    return;
  }

  localStorage.setItem("auth0_custom_config", JSON.stringify({ domain, clientId }));
  window.location.reload();
}

function resetConfig() {
  localStorage.removeItem("auth0_custom_config");
  window.location.reload();
}

// Event Bindings
function bindEvents() {
  document.getElementById("btnLoginRedirect")?.addEventListener("click", loginRedirect);
  document.getElementById("btnLoginPopup")?.addEventListener("click", loginPopup);
  document.getElementById("btnLogout")?.addEventListener("click", logout);
  document.getElementById("btnSimulateApi")?.addEventListener("click", simulateProtectedApi);
  document.getElementById("btnCopyToken")?.addEventListener("click", copyRawToken);

  // Settings Modal
  document.getElementById("btnConfigToggle")?.addEventListener("click", openConfigModal);
  document.getElementById("btnCloseConfig")?.addEventListener("click", closeConfigModal);
  document.getElementById("btnSaveConfig")?.addEventListener("click", saveConfig);
  document.getElementById("btnResetConfig")?.addEventListener("click", resetConfig);
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Bootstrap
window.addEventListener("DOMContentLoaded", initApp);
