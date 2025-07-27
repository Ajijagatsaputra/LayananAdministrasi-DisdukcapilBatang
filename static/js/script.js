document.addEventListener("DOMContentLoaded", () => {
  // Header scroll effect
  const header = document.querySelector("header");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });

  // Mobile menu toggle
  const menuToggle = document.querySelector(".menu-toggle");
  const navMenu = document.querySelector(".nav-menu");

  menuToggle.addEventListener("click", () => {
    navMenu.classList.toggle("active");
    document.body.classList.toggle("menu-open");
  });

  // Close menu when clicking on a link
  const navLinks = document.querySelectorAll(".nav-menu a");

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("active");
      document.body.classList.remove("menu-open");
    });
  });

  // Smooth scrolling for navigation links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("href");

      if (targetId === "#") return;

      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        const headerHeight = document.querySelector("header").offsetHeight;
        const targetPosition =
          targetElement.getBoundingClientRect().top +
          window.pageYOffset -
          headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });
      }
    });
  });

  // FAQ accordion
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");

    question.addEventListener("click", () => {
      const isActive = item.classList.contains("active");

      // Close all FAQ items
      faqItems.forEach((faqItem) => {
        faqItem.classList.remove("active");
        const toggleIcon = faqItem.querySelector(".toggle-icon");
        toggleIcon.textContent = "+";
      });

      // If the clicked item wasn't active, open it
      if (!isActive) {
        item.classList.add("active");
        const toggleIcon = item.querySelector(".toggle-icon");
        toggleIcon.textContent = "−";
      }
    });
  });

  // Chatbot functionality
  const chatButton = document.getElementById("chatButton");
  const chatBox = document.getElementById("chatBox");
  const closeChat = document.getElementById("closeChat");
  const userMessage = document.getElementById("userMessage");
  const sendMessage = document.getElementById("sendMessage");
  const chatMessages = document.getElementById("chatMessages");

  // Toggle chat box
  chatButton.addEventListener("click", () => {
    chatBox.classList.toggle("active");
    if (chatBox.classList.contains("active")) {
      userMessage.focus();
    }
  });

  // Close chat box
  closeChat.addEventListener("click", () => {
    chatBox.classList.remove("active");
  });

  // Send message function
  function sendUserMessage() {
    const message = userMessage.value.trim();

    if (message !== "") {
      // Add user message to chat
      addMessage("user", message);

      // Clear input
      userMessage.value = "";

      // Show typing indicator
      showTypingIndicator();

      // Send to backend and get response
      fetch("/get_response", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: message }),
      })
        .then((response) => response.json())
        .then((data) => {
          // Remove typing indicator
          removeTypingIndicator();

          // Add bot response to chat
          addMessage("bot", data.response);

          // Scroll to bottom
          scrollToBottom();
        })
        .catch((error) => {
          console.error("Error:", error);
          removeTypingIndicator();
          addMessage(
            "bot",
            "Maaf, terjadi kesalahan. Silakan coba lagi nanti."
          );
          scrollToBottom();
        });
    }
  }

  // Add message to chat
  function addMessage(sender, text) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", sender);

    const contentDiv = document.createElement("div");
    contentDiv.classList.add("message-content");

    // Process text for links and formatting
    const processedText = processMessageText(text);
    contentDiv.innerHTML = processedText;

    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);

    // Scroll to bottom
    scrollToBottom();
  }

  // Process message text for formatting
  function processMessageText(text) {
    // Jangan ubah apa pun jika sudah mengandung tag <a>
    if (!text.includes("<a")) {
      // Kalau belum ada HTML <a>, konversi link biasa jadi hyperlink
      text = text.replace(
        /(https?:\/\/[^\s]+)/g,
        '<a href="$1" target="_blank">$1</a>'
      );
    }

    // Ganti newline dengan <br>
    text = text.replace(/\n/g, "<br>");

    return text;
  }

  // Show typing indicator
  function showTypingIndicator() {
    const typingDiv = document.createElement("div");
    typingDiv.classList.add("message", "bot", "typing-indicator");

    const contentDiv = document.createElement("div");
    contentDiv.classList.add("message-content");
    contentDiv.innerHTML =
      '<div class="typing"><span></span><span></span><span></span></div>';

    typingDiv.appendChild(contentDiv);
    chatMessages.appendChild(typingDiv);

    scrollToBottom();
  }

  // Remove typing indicator
  function removeTypingIndicator() {
    const typingIndicator = document.querySelector(".typing-indicator");
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }

  // Scroll chat to bottom
  function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Send message on button click
  sendMessage.addEventListener("click", sendUserMessage);

  // Send message on Enter key
  userMessage.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendUserMessage();
    }
  });

  const intents = [
    {
      tag: "pencatatan_sipil",
      patterns: ["Pencatatan Sipil", "Catat pernikahan", "Catat kelahiran"],
      responses: [
        "Pencatatan Sipil mencakup layanan seperti pencatatan perkawinan, perceraian, kelahiran, kematian, dan perubahan nama. Semua dapat dilakukan di Disdukcapil dengan dokumen yang sesuai.",
      ],
    },
    {
      tag: "pendaftaran_penduduk",
      responses: [
        "Untuk pendaftaran penduduk, silakan kunjungi Disdukcapil dengan membawa dokumen yang diperlukan seperti KTP dan KK.",
      ],
    },
    {
      tag: "layanan_informasi_umum",
      responses: [
        "Kami siap memberikan informasi umum terkait layanan administrasi kependudukan, jam operasional, dan kontak Disdukcapil.",
      ],
    },
  ];

  const hardcodedResponses = {
    pendaftaran_penduduk: `Pendaftaran penduduk meliputi pembuatan KTP, Kartu Keluarga, surat pindah, dan lainnya. 
    Silakan kunjungi kantor Disdukcapil atau layanan online melalui IKD (Identitas Kependudukan Digital). 
    <a href="http://127.0.0.1:5000/#persyaratan" target="_blank">Lihat persyaratan di sini</a>.`,

    pencatatan_sipil: `Pencatatan sipil mencakup pembuatan akta kelahiran, akta kematian, akta perkawinan, dan perceraian, akta pengangkatan anak, akta pengesahan anak dan akta pengakuan anak. 
    <a href="http://127.0.0.1:5000/#persyaratan" target="_blank">Lihat persyaratan di sini</a>.`,

    layanan_informasi_umum: `Layanan informasi umum mencakup jam pelayanan, lokasi kantor Disdukcapil Kabupaten Batang, serta informasi administratif lainnya. 
    <a href="http://127.0.0.1:5000/#kontak" target="_blank">Informasi Umum Disini</a>.`,
  };

  // Handle suggestion buttons
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("suggestion-btn")) {
      const intentTag = e.target.dataset.intent;
      if (intentTag in hardcodedResponses) {
        // Tampilkan pertanyaan user
        addMessage("user", e.target.textContent);

        // Ambil respons dari hardcodedResponses yang mengandung link
        const botResponse = hardcodedResponses[intentTag];
        addMessage("bot", botResponse);
        scrollToBottom();
      }
    }
  });

  // Form validation
  const contactForm = document.getElementById("contactForm");

  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      // Simple form validation
      let isValid = true;
      const requiredFields = contactForm.querySelectorAll("[required]");

      requiredFields.forEach((field) => {
        if (!field.value.trim()) {
          isValid = false;
          field.classList.add("error");
        } else {
          field.classList.remove("error");
        }
      });

      if (isValid) {
        // Here you would normally send the form data to the server
        // For demo purposes, we'll just show a success message
        alert("Pesan Anda telah terkirim. Terima kasih!");
        contactForm.reset();
      } else {
        alert("Mohon lengkapi semua field yang diperlukan.");
      }
    });
  }

  // Add placeholder images if real images are not available
  document.querySelectorAll("img").forEach((img) => {
    img.addEventListener("error", function () {
      if (!this.src.includes("placeholder")) {
        const width = this.getAttribute("width") || 300;
        const height = this.getAttribute("height") || 200;
        this.src = `https://via.placeholder.com/${width}x${height}?text=${
          this.alt || "Image"
        }`;
      }
    });
  });

  // Initialize any sliders or carousels if needed
  // This is a simple manual slider for testimonials
  if (document.querySelector(".testimonial-slider")) {
    const slides = document.querySelectorAll(".testimonial-slide");
    const dots = document.querySelectorAll(".testimonial-dots .dot");
    const prevBtn = document.querySelector(".testimonial-prev");
    const nextBtn = document.querySelector(".testimonial-next");
    let currentSlide = 0;

    function showSlide(index) {
      slides.forEach((slide) => slide.classList.remove("active"));
      dots.forEach((dot) => dot.classList.remove("active"));

      slides[index].classList.add("active");
      dots[index].classList.add("active");
      currentSlide = index;
    }

    if (prevBtn && nextBtn) {
      prevBtn.addEventListener("click", () => {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
      });

      nextBtn.addEventListener("click", () => {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
      });
    }

    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        showSlide(index);
      });
    });

    // Auto slide every 5 seconds
    setInterval(() => {
      currentSlide = (currentSlide + 1) % slides.length;
      showSlide(currentSlide);
    }, 5000);
  }
});
