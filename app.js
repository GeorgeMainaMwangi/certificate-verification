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

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    isAdminLoggedIn = true;
    loginStatus.innerText = "Admin login successful.";
    loginStatus.style.color = "green";
    adminPanel.classList.remove("hidden");
  } else {
    loginStatus.innerText = "Invalid admin credentials.";
    loginStatus.style.color = "red";
  }
}

function issueCertificate() {
  if (!isAdminLoggedIn) {
    document.getElementById("issueStatus").innerText = "Please login as admin first.";
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

  generateQRCode(certificateId);
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
