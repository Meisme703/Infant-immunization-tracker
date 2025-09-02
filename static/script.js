document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registrationForm");

  // 🔁 Sync pending registrations when online
  window.addEventListener("load", syncPendingRegistrations);
  window.addEventListener("online", syncPendingRegistrations);

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const clinicName = document.getElementById("clinicName").value;
    const childName = document.getElementById("childName").value;
    const dob = document.getElementById("dob").value;
    const motherName = document.getElementById("motherName").value;
    const phone = document.getElementById("phone").value;

    const registrationData = {
      clinicName,
      childName,
      dob,
      motherName,
      phone,
      timestamp: new Date().toISOString()
    };

    // 💾 Save to localStorage
    localStorage.setItem("latestRegistration", JSON.stringify(registrationData));

    // 🚀 Try sending to Flask backend
    fetch("/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(registrationData)
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          alert(data.message); // ✅ Registration received!
          form.reset();
        } else {
          alert(data.error || "Server error.");
        }
      })
      .catch((error) => {
        console.warn("Offline or server error — saving to queue.");
        queuePendingRegistration(registrationData);
        alert("Saved locally. Will sync when online.");
      });
  });

  // 🧠 Save failed registration to queue
  function queuePendingRegistration(data) {
    let queue = JSON.parse(localStorage.getItem("pendingRegistrations")) || [];
    queue.push(data);
    localStorage.setItem("pendingRegistrations", JSON.stringify(queue));
  }

  // 🔁 Sync queued registrations
  function syncPendingRegistrations() {
    const queue = JSON.parse(localStorage.getItem("pendingRegistrations")) || [];
    if (queue.length === 0) return;

    console.log(`🔄 Syncing ${queue.length} pending registrations...`);

    queue.forEach((data, index) => {
      fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
        .then((res) => res.json())
        .then((result) => {
          console.log(`✅ Synced: ${data.childName}`);
        })
        .catch((err) => {
          console.warn(`❌ Failed to sync: ${data.childName}`);
        });
    });

    // Clear queue after attempting sync
    localStorage.removeItem("pendingRegistrations");
  }
});