let certificates = JSON.parse(localStorage.getItem("certificates")) || {};
let isAdminLoggedIn = false;

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "1234";

function saveCertificates() {
  localStorage.setItem("certificates", JSON.stringify(certificates));
}

function adminLogin() {
  const username = document.getElementById("adminUsername").value.trim();
  const password = document.getElementById("adminPassword").value.trim();
  const loginStatus = document.getElementById("loginStatus");
  const adminPanel = document.getElementById("adminPanel");
  const issuedCertificatesCard = document.getElementById("issuedCertificatesCard");

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    isAdminLoggedIn = true;
    loginStatus.innerText = "Admin login successful.";
    loginStatus.style.color = "green";
    adminPanel.classList.remove("hidden");
    issuedCertificatesCard.classList.remove("hidden");
    renderIssuedCertificates();
  } else {
    loginStatus.innerText = "Invalid admin credentials.";
    loginStatus.style.color = "red";
  }
}

function logoutAdmin() {
  isAdminLoggedIn = false;
  document.getElementById("loginStatus").innerText = "Admin logged out.";
  document.getElementById("loginStatus").style.color = "#444";
  document.getElementById("adminPanel").classList.add("hidden");
  document.getElementById("issuedCertificatesCard").classList.add("hidden");
  document.getElementById("qrSection").classList.add("hidden");
  document.getElementById("adminUsername").value = "";
  document.getElementById("adminPassword").value = "";
}

function issueCertificate() {
  if (!isAdminLoggedIn) {
    document.getElementById("issueStatus").innerText = "Please login as admin first.";
    document.getElementById("issueStatus").style.color = "red";
    return;
  }

  const certificateId = document.getElementById("certificateId").value.trim();
  const studentName = document.getElementById("studentName").value.trim();
  const courseName = document.getElementById("courseName").value.trim();
  const dateIssued = document.getElementById("dateIssued").value.trim();
  const issueStatus = document.getElementById("issueStatus");

  if (!certificateId || !studentName || !courseName || !dateIssued) {
    issueStatus.innerText = "Please fill all fields.";
    issueStatus.style.color = "red";
    return;
  }

  if (certificates[certificateId]) {
    issueStatus.innerText = "Certificate already exists.";
    issueStatus.style.color = "red";
    return;
  }

  certificates[certificateId] = {
    studentName,
    courseName,
    dateIssued
  };

  saveCertificates();

  issueStatus.innerText = "Certificate issued successfully.";
  issueStatus.style.color = "green";

  document.getElementById("certificateId").value = "";
  document.getElementById("studentName").value = "";
  document.getElementById("courseName").value = "";
  document.getElementById("dateIssued").value = "";

  generateQRCode(certificateId);
  renderIssuedCertificates();
}

function verifyCertificate() {
  const verifyId = document.getElementById("verifyId").value.trim();
  const resultDiv = document.getElementById("verifyResult");

  if (!verifyId) {
    resultDiv.innerHTML = "<p>Please enter a certificate ID.</p>";
    return;
  }

  if (certificates[verifyId]) {
    const cert = certificates[verifyId];
    resultDiv.innerHTML = `
      <p><strong>Status:</strong> Valid Certificate</p>
      <p><strong>Certificate ID:</strong> ${verifyId}</p>
      <p><strong>Student Name:</strong> ${cert.studentName}</p>
      <p><strong>Course Name:</strong> ${cert.courseName}</p>
      <p><strong>Date Issued:</strong> ${cert.dateIssued}</p>
    `;
  } else {
    resultDiv.innerHTML = `<p><strong>Status:</strong> Certificate not found</p>`;
  }
}

function verifyFromList(certificateId) {
  document.getElementById("verifyId").value = certificateId;
  verifyCertificate();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function deleteCertificate(certificateId) {
  if (!isAdminLoggedIn) return;

  const confirmed = confirm(`Delete certificate ${certificateId}?`);
  if (!confirmed) return;

  delete certificates[certificateId];
  saveCertificates();
  renderIssuedCertificates();

  const verifyInput = document.getElementById("verifyId").value.trim();
  if (verifyInput === certificateId) {
    document.getElementById("verifyResult").innerHTML = "<p><strong>Status:</strong> Certificate deleted</p>";
  }
}

function renderIssuedCertificates() {
  const listContainer = document.getElementById("issuedCertificatesList");
  const totalCertificates = document.getElementById("totalCertificates");
  const ids = Object.keys(certificates);

  totalCertificates.innerText = `Total Certificates: ${ids.length}`;

  if (ids.length === 0) {
    listContainer.innerHTML = "<p>No certificates issued yet.</p>";
    return;
  }

  listContainer.innerHTML = ids.map(id => {
    const cert = certificates[id];
    return `
      <div class="certificate-item">
        <h4>${id}</h4>
        <p><strong>Student:</strong> ${cert.studentName}</p>
        <p><strong>Course:</strong> ${cert.courseName}</p>
        <p><strong>Date Issued:</strong> ${cert.dateIssued}</p>
        <div class="certificate-actions">
          <button class="success" onclick="verifyFromList('${id}')">Verify</button>
          <button onclick="generateQRCode('${id}')">QR Code</button>
          <button class="danger" onclick="deleteCertificate('${id}')">Delete</button>
        </div>
      </div>
    `;
  }).join("");
}

function generateQRCode(certificateId) {
  const qrSection = document.getElementById("qrSection");
  const qrContainer = document.getElementById("qrcode");
  const qrLink = document.getElementById("qrLink");

  qrContainer.innerHTML = "";

  const verificationUrl = `${window.location.origin}${window.location.pathname}?id=${certificateId}`;

  new QRCode(qrContainer, {
    text: verificationUrl,
    width: 180,
    height: 180
  });

  qrLink.innerHTML = `<strong>Verification URL:</strong> <a href="${verificationUrl}" target="_blank">${verificationUrl}</a>`;
  qrSection.classList.remove("hidden");
}

function autoVerifyFromURL() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (id) {
    document.getElementById("verifyId").value = id;
    verifyCertificate();
  }
}

window.onload = function () {
  autoVerifyFromURL();
};
