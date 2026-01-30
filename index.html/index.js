//MODAL FUNCTION

// === NAV MODAL === //
const menuIcon = document.getElementById("ri-menu-line");
const navModal = document.getElementById("nav-modal");
const overlay = document.getElementById("nav-overlay");
const closeModal = document.getElementById("close-modal");

// Open modal
menuIcon.addEventListener("click", () => {
  navModal.classList.add("active");
  overlay.classList.add("active");
  document.body.style.overflow = "hidden";
});

// Close modal (shared function)
function closeMenu() {
  navModal.classList.remove("active");
  overlay.classList.remove("active");
  document.body.style.overflow = "auto";
}

// Close via icon or overlay
closeModal.addEventListener("click", closeMenu);
overlay.addEventListener("click", closeMenu);

// Close when clicking links inside modal
document.querySelectorAll("#nav-modal a").forEach((link) => {
  link.addEventListener("click", () => {
    closeMenu();
    // Routing handled automatically by hashchange event
  });
});

// === ROUTER FUNCTION ===
const main = document.getElementById("main");

async function fetchJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error("Fetch error: " + res.status);
  return res.json();
}

window.addEventListener("hashchange", router);
window.addEventListener("load", router);

function router() {
  const path = location.hash.slice(1) || "/";

  // Always ensure modal/overlay are closed before rendering
  closeMenu();

  if (path === "/") generateHome();
  else if (path.startsWith("/listings")) {
    const queryString = path.split("?")[1] || "";
    const params = new URLSearchParams(queryString);
    const filters = {
      status: params.get("status") || "",
      type: params.get("type") || "",
      location: params.get("location") || "",
    };
    generateListings(filters);
  } else if (path.startsWith("/property/")) {
    const id = path.split("/")[2];
    generateProperty(id);
  } else if (path === "/about") generateAbout();
  else if (path === "/contact") generateContact();
  else generateHome();

  window.scrollTo(0, 0);
}

// Function to create property card >>
function propertyCardGenerator(property) {
  return `
  <div class="property-card">
          <div class="property-card-image">
            <img src="${property.hero_image}" alt="" loading="lazy" />
          </div>
          <div class="property-card-info">
            <h5><span>${property.price}</span>${property.per_month || ""}</h5>
            <h4>${property.title}</h4>
            <p>${property.location}</p>
            <div class="card-features">
              <p>${property.beds} bed</p>
              <p>- ${property.baths} bath</p>
              <p>- ${property.area}</p>
            </div>
            <div class="prop-card-btn">
             <a href="#/property/${
               property.id
             }" id="view-details">View Details</a>
            </div>
          </div>
        </div>
  `;
}

// FUNCTION TO GENERATE THE HOME PAGE
async function generateHome() {
  main.innerHTML = `
  <section>
      <div class="main-container">
        <section class="main-banner">
          <div class="main-content">
            <h1>Find Your Perfect <span class="highlight">Home</span></h1>
            <p>Buy And Rent. All in one place.</p>

            <div>
              <div class="main-search">
                <select class="status-select">
                  <option value="">Select Option</option>
                  <option value="FOR SALE">Buy</option>
                  <option value="FOR RENT">Rent</option>
                </select>
                <select id="home-type">
                  <option value="">Property Type</option>
                  <option value="Duplex">Duplex</option>
                  <option value="Bungalow">Bungalow</option>
                  <option value="Mini Flat">Mini Flat</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Studio">Studio</option>
                  <option value="Villa">Villa</option>
                  <option value="Commercial">Commercial</option>
                </select>
                <input
                  type="text"
                  name=""
                  id="home-location"
                  placeholder="Location or Area"
                />
                <button class="home-search-btn">Search</button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div class="featured-properties-wrapper">
        <h2 class="title">Featured Properties</h2>
        <div class="red-line"></div>
        
        <div class="card-holder" id="featured-properties">
        </div>
        <a href="#/listings class="see-more">See More</a>
      </div>

      <div class="container">
        <h2 class="title">Popular Locations</h2>
        <div class="red-line"></div>

        <div class="location">
          <div class="location-card" id="lagos">
            <img id="lagos" src="images/lagos.jpg" alt="Lagos" />
            <span class="label">LAGOS</span>
          </div>
          <div class="location-card" id="abuja">
            <img id="abuja" src="images/abuja.jpg" alt="Abuja" />
            <span class="label">ABUJA</span>
          </div>
          <div class="location-card" id="delta">
            <img id="delta" src="images/delta.jpg" alt="Delta" />
            <span class="label">DELTA</span>
          </div>
          <div class="location-card" id="enugu">
            <img id="enugu" src="images/enugu.jpg" alt="Enugu" />
            <span class="label">ENUGU</span>
          </div>
        </div>
      </div>

      <div class="cta-home">
        <h2>Find Your Next Home Today</h2>
        <p>Fast, secure, and trusted by homeowners nationwide.</p>
        <button><a href="#/listings">Browse Listings</a></button>
      </div>
    </section>

  `;

  // Home search logic
  const homeSearchBtn = document.querySelector(".home-search-btn");
  const homeStatus = document.querySelector(".status-select");
  const homeType = document.getElementById("home-type");
  const homeLocation = document.getElementById("home-location");

  homeSearchBtn.addEventListener("click", () => {
    const statusValue = homeStatus.value.trim().toUpperCase();
    const typeValue = homeType.value.trim();
    const locationValue = homeLocation.value.trim().toLowerCase();

    if (!statusValue || !typeValue || !locationValue) {
      alert("Please fill all fields before searching!");
      return;
    }

    // Build filter query
    const searchParams = new URLSearchParams();
    if (statusValue) searchParams.append("status", statusValue);
    if (typeValue) searchParams.append("type", typeValue);
    if (locationValue) searchParams.append("location", locationValue);

    // Navigate to listings with query
    location.hash = `/listings?${searchParams.toString()}`;
  });

  try {
    const data = await fetchJSON("data/properties.json");
    const featured = data.properties.filter((p) => p.featured);
    const container = document.getElementById("featured-properties");
    container.innerHTML = featured.map(propertyCardGenerator).join("");
  } catch (e) {
    console.error(e);
    document.getElementById("featured-properties").innerHTML =
      '<p class="no-results">Unable to load featured properties.</p>';
  }
}

// FUNCTION TO GENERATE LISTINGS PAGE
async function generateListings(initialFilters = {}) {
  main.innerHTML = `
  <section>
    <div class="listings-hero">
      <div class="listings-hero-img">
        <div class="overlay-white"></div>
        <img src="./images/skyline.jpg" alt="" />
      </div>
    </div>

    <div class="listings-hero-title">
      <h1>Explore Listings</h1>
      <div class="red-line"></div>
      <p>Find homes and properties tailored to your needs.</p>
    </div>

    <div class="filters-bar">
      <div class="filter-search-bar">
        <input
          type="search"
          id="filter-search"
          placeholder="Search by name, location, or keyword"
        />
      </div>

      <div class="other-filters">
        <select id="property-type">
          <option value="">Any Type</option>
          <option value="Duplex">Duplex</option>
          <option value="Bungalow">Bungalow</option>
          <option value="Mini Flat">Mini Flat</option>
          <option value="Apartment">Apartment</option>
          <option value="Studio">Studio</option>
          <option value="Villa">Villa</option>
          <option value="Commercial">Commercial</option>
        </select>

        <select id="price-range">
          <option value="">Any Price</option>
          <option value="low">₦100,000 - ₦300,000</option>
          <option value="medium">₦350,000 - ₦20,000,000</option>
          <option value="high">₦30,000,000 - ₦500,000,000</option>
          <option value="luxury">₦600,000,000+</option>
        </select>

        <select id="status-filter">
          <option value="">Any Status</option>
          <option value="FOR SALE">For Sale</option>
          <option value="FOR RENT">For Rent</option>
        </select>

        <select id="sort-order">
          <option value="">Sort By</option>
          <option value="priceLowHigh">Price: Low → High</option>
          <option value="priceHighLow">Price: High → Low</option>
          <option value="newest">Newest Listings</option>
          <option value="size">Size (Area)</option>
        </select>
      </div>

      <div class="filter-actions">
        <button class="red-btn" id="apply-filters">Apply Filters</button>
        <button class="clear-btn" id="clear-filters">Clear Filters</button>
      </div>
    </div>

    <p id="results-count" class="results-count"></p>
    <div class="properties" id="properties"></div>
  </section>`;

  try {
    // Parse filters from query
    const hash = location.hash;
    const queryIndex = hash.indexOf("?");
    if (queryIndex !== -1) {
      const queryString = hash.slice(queryIndex + 1);
      const params = new URLSearchParams(queryString);
      initialFilters = {
        status: params.get("status") || "",
        type: params.get("type") || "",
        location: params.get("location") || "",
      };
    }

    const data = await fetchJSON("data/properties.json");
    const allProperties = data.properties;
    const container = document.getElementById("properties");

    // Select filter elements
    const searchInput = document.getElementById("filter-search");
    const typeSelect = document.getElementById("property-type");
    const priceSelect = document.getElementById("price-range");
    const statusSelect = document.getElementById("status-filter");
    const sortSelect = document.getElementById("sort-order");
    const filterBtn = document.getElementById("apply-filters");
    const clearBtn = document.getElementById("clear-filters");

    // Prefill filters if coming from home search
    if (initialFilters.status) statusSelect.value = initialFilters.status;
    if (initialFilters.type) typeSelect.value = initialFilters.type;
    if (initialFilters.location) searchInput.value = initialFilters.location;

    // --- Helper functions ---
    function normalize(str) {
      return str ? str.trim().toLowerCase() : "";
    }

    function parsePrice(value) {
      return parseInt(value.replace(/[₦,]/g, "")) || 0;
    }

    function checkPriceRange(priceStr, range) {
      const price = parsePrice(priceStr);
      switch (range) {
        case "low":
          return price >= 100000 && price <= 300000;
        case "medium":
          return price >= 350000 && price <= 20000000;
        case "high":
          return price >= 30000000 && price <= 500000000;
        case "luxury":
          return price >= 600000000;
        default:
          return true;
      }
    }

    function applySorting(list, sortValue) {
      const sorted = [...list];
      switch (sortValue) {
        case "priceLowHigh":
          return sorted.sort(
            (a, b) => parsePrice(a.price) - parsePrice(b.price)
          );
        case "priceHighLow":
          return sorted.sort(
            (a, b) => parsePrice(b.price) - parsePrice(a.price)
          );
        case "size":
          return sorted.sort(
            (a, b) =>
              parseInt(a.area.replace(/\D/g, "")) -
              parseInt(b.area.replace(/\D/g, ""))
          );
        case "newest":
          return sorted.sort((a, b) => b.id - a.id);
        default:
          return list;
      }
    }

    function renderProperties(list) {
      const resultsCount = document.getElementById("results-count");
      if (list.length === 0) {
        resultsCount.textContent = "No properties found.";
        container.innerHTML = `<p class="no-results">No properties match your filters.</p>`;
      } else {
        resultsCount.textContent = `Showing ${list.length} ${
          list.length === 1 ? "property" : "properties"
        }`;
        container.innerHTML = list.map(propertyCardGenerator).join("");
      }
    }

    // --- Main filtering + sorting logic ---
    function applyFilters() {
      const searchValue = normalize(searchInput.value);
      const typeValue = typeSelect.value;
      const priceValue = priceSelect.value;
      const statusValue = statusSelect.value;
      const sortValue = sortSelect.value;

      // Filter
      const filtered = allProperties.filter((p) => {
        const matchesSearch =
          !searchValue ||
          normalize(p.title).includes(searchValue) ||
          normalize(p.location).includes(searchValue) ||
          (p.description && normalize(p.description).includes(searchValue)) ||
          (p.features &&
            p.features.join(" ").toLowerCase().includes(searchValue)) ||
          (p.amenities &&
            p.amenities.join(" ").toLowerCase().includes(searchValue));

        const matchesType = !typeValue || p.type === typeValue;
        const matchesStatus = !statusValue || p.status === statusValue;
        const matchesPrice = checkPriceRange(p.price, priceValue);

        return matchesSearch && matchesType && matchesStatus && matchesPrice;
      });

      // Sort
      const sorted = applySorting(filtered, sortValue);

      // Render
      renderProperties(sorted);
    }

    // --- Event Listeners ---
    filterBtn.addEventListener("click", applyFilters);
    sortSelect.addEventListener("change", applyFilters);

    clearBtn.addEventListener("click", () => {
      searchInput.value = "";
      typeSelect.value = "";
      priceSelect.value = "";
      statusSelect.value = "";
      sortSelect.value = "";
      renderProperties(allProperties);
    });

    // --- Initial render (with home filters applied) ---
    applyFilters();
  } catch (e) {
    console.error(e);
    document.getElementById("properties").innerHTML =
      '<p class="no-results">Unable to load listings.</p>';
  }
}

// FUNCTION TO GENERATE PROPERTY DETAILS
async function generateProperty(id) {
  main.innerHTML = `
  <section class="container"><p>Loading property...</p></section>`;

  try {
    const data = await fetchJSON("data/properties.json");
    const property = data.properties.find((p) => String(p.id) === String(id));
    if (!property) {
      main.innerHTML = `<section class="container"><p>Property not found</p></section>`;
    }

    // to map through the amenities array
    const amenityArr = property.amenities
      .map(
        (a) => `<div class="amenity">
            <h5>${a}</h5>
          </div>`
      )
      .join("");

    // to map through the features array
    const featureArr = property.features
      .map((f) => `<li><span>${f}</span></li>`)
      .join("");

    // to render the page content in the html
    main.innerHTML = `
     <section>
      <div class="property-det-hero">
        <div class="overlay"></div>
        <img src="${property.hero_image}" alt="hero-img" />
      <div class="det-hero-info">
        <p>Home / Listings / ${property.title}</p>
        <h2>${property.title}</h2>
        <h4>${property.location}</h4>
        <p class="sale-badge">${property.status}</p>
      </div>
      </div>
      <div class="features-bar">
        <p class="red-text">${property.price}</p>
        <p>${property.type}</p>
        <p>${property.beds} Bed</p>
        <p>${property.baths} Bath</p>
        <p>${property.area}</p>
        <p class="red-text">${property.status}</p>
      </div>
      <div class="property-overview">
        <div class="overview-text">
          <div class="overview-text-title">
            <h2>Property Overview</h2>
          </div>
          <p>
            ${property.description}
          </p>
          <ul>
            ${featureArr}
          </ul>
        </div>
        <div class="overview-image">
          <img src="${property.overview_image}" alt="" />
        </div>
      </div>
      <div class="property-gallery">
        <div class="gallery-left">
          <img src="${property.galler_img_one}" alt="" />
        </div>
        <div class="gallery-mid">
          <div class="gallery-mid-top">
            <img src="${property.galler_img_two}" alt="" />
          </div>
          <div class="gallery-mid-bottom">
            <img src="${property.galler_img_three}" alt="" />
          </div>
        </div>
        <div class="gallery-right">
          <img src="${property.galler_img_four}" alt="" />
        </div>
      </div>
      <div class="property-amenities">
        <h2>Amenities</h2>
        <div class="amenities-content">
          ${amenityArr}
        </div>
      </div>

      <div class="property-det-map">
        <iframe
          src="https:${property.mapQuery}"
          width="100%"
          height="450"
          style="border: 0"
          allowfullscreen=""
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
      <div class="agent-contact">
        <div class="agent-contact-title">
          <h2>Interested in this property? Let’s schedule a viewing.</h2>
        </div>
        <div class="agent-contact-info">
          <div class="agent-info-img">
            <img src="${property.agent_image}" alt="" />
          </div>
          <div class="agent-info-text">
            <h4>${property.agent_name}</h4>
            <h5>Senior Realtor, RealEstatePro</h5>
            <p>${property.agent_no}</p>
            <p>${property.agent_mail}</p>
            <div>
              <a href="tel:${property.agent_no}" id="agent-btn">Contact Agent</a>
            </div>
          </div>
        </div>
      </div>
    </section>
    `;
  } catch (e) {
    console.error(e);
    main.innerHTML =
      '<section class="container"><p>Could not load property details.</p></section>';
  }
}

// FUNCTION TO RENDER CONTACT PAGE
async function generateContact() {
  main.innerHTML = `
   <section>
        <div class="contact-header"  style="display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 15px;
  padding-top: 150px;
  height: 50vh;
  border-bottom: 1px solid #c62828;">
          <h1>Contact Us</h1>
          <div class="red-line"></div>
          <p>We'd love to hear from you — reach out anytime.</p>
        </div>

        <div class="contact-card-wrapper">
          <div class="contact-card">
            <div class="contact-card-title">
              <i class="ri-map-pin-3-line"></i>
              <h4>Our Office</h4>
            </div>
            <p>
              <a
                href="https://www.google.com/maps?q=12B+Admiralty+Way,+Lekki+Phase+1,+Lagos"
                target="_blank"
                class="contact-link"
              >
                12B Admiralty Way,<br />
                Lekki Phase 1, Lagos </a
              ><br />
              Mon - Fri, 9:00 AM - 6:00 PM
            </p>
          </div>

          <div class="contact-card">
            <div class="contact-card-title">
              <i class="ri-phone-line"></i>
              <h4>Call Us</h4>
            </div>
            <p>
              <a href="tel:+2348001234567" class="contact-link"
                >+234 800 123 4567</a
              ><br />
              <a href="tel:+2348098765432" class="contact-link"
                >+234 809 876 5432</a
              >
            </p>
          </div>

          <div class="contact-card">
            <div class="contact-card-title">
              <i class="ri-mail-line"></i>
              <h4>Email Us</h4>
            </div>
            <p>
              <a href="mailto:info@realestatepro.com" class="contact-link"
                >info@realestatepro.com</a
              ><br />
              <a href="mailto:support@realestatepro.com" class="contact-link"
                >support@realestatepro.com</a
              >
            </p>
          </div>
        </div>
      </div>

      <div class="message-form">
        <h2>Send Us A Message</h2>
        <div class="red-line"></div>

        <form action="#" method="post" id="contact-form">
          <div class="form-detail">
            <input type="text" name="name" placeholder="Your Name" required />

            <input
              type="email"
              name="email"
              placeholder="Your Email"
              required
            />
          </div>

          <div class="form-group">
            <input type="text" name="subject" placeholder="Subject" required />
          </div>
          <div class="form-group">
            <textarea
              name="message"
              rows="5"
              placeholder="Your Message"
              required
            ></textarea>
          </div>
          <button type="submit" class="btn">Send Message</button>
        </form>
      </div>

      <div class="map-section">
         <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.410400866365!2d3.624233574784752!3d6.469584123787991!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103bf979fee11457%3A0xa5d6185fb1770461!2sAptech%20Computer%20Education%20Ajah%20Centre!5e0!3m2!1sen!2sng!4v1761219580375!5m2!1sen!2sng" 
         width="100%" height="450" style="border:0;" allowfullscreen="" loading="lazy" 
         referrerpolicy="no-referrer-when-downgrade"></iframe>
      </div>
    </section>
  `;

  const form = document.getElementById("contact-form");

  form.addEventListener("submit", function (e) {
    e.preventDefault(); // Prevent page reload

    // Get input values
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const subject = form.subject.value.trim();
    const message = form.message.value.trim();

    // Basic validation
    if (!name || !email || !subject || !message) {
      alert("⚠️ Please fill in all fields before submitting.");
      return;
    }

    // Email format validation
    const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
    if (!email.match(emailPattern)) {
      alert("🚫 Please enter a valid email address.");
      return;
    }

    // Simulate successful submission
    alert(`✅ Thank you, ${name}! Your message has been sent successfully.`);

    // Optionally clear the form
    form.reset();
  });
}

// FUNCTION TO GENERATE ABOUT
async function generateAbout() {
  main.innerHTML = `
  <section>
      <div class="about-hero">
        <div class="about-hero-img">
          <img src="./images/about-page-bg.jpeg" alt="" />
        </div>
      </div>
      <section class="about-title-section">
        <h1 class="about-title">About RealEstatePro</h1>
        <div class="red-line"></div>
        <p>Building trust through transparent property experiences</p>
      </section>
      <section class="story-section">
        <div class="story-content">
          <div class="story-content-text">
            <div class="our-story">
              <h2>Our Story</h2>
              <p>
                RealEstatePro was build to simplify the way people find, list,
                and mange properties. From cozy apartments to luxury homes, we
                connect buyers, renters, and sellers through a trusted,
                easy-to-use platform designed for transparency and convenience.
              </p>
            </div>
            <div class="our-story">
              <h2>Our Mission</h2>
              <p>
                To make real estate simpler, faster, and smarter - empowering
                every home-seeker and property owner with confidence.
              </p>
            </div>
            <div class="our-story">
              <h2>Our Values</h2>
              <ul>
                <li>Integrity</li>
                <li>Accesibility</li>
                <li>Innovation</li>
              </ul>
            </div>
          </div>
          <img class="story-img" src="/images/about-page-house.jpeg" alt="" />
        </div>
      </section>
      <section class="testimonial-section">
        <h2>What Our Users Say</h2>
         <div class="red-line"></div>
        <div class="testimonial-content">
          <div class="testimonial">
            <p>
              "I found my apartments through RealEstatePro, and the process was
              suprisingly easy. The filters made it so simple to narrow down my
              options and the agent I connectxed with was super professional"
            </p>
            <h3>Chidinma E. - Lagos</h3>
            <div class="ratings">
              <i class="ri-star-fill"></i>
              <i class="ri-star-fill"></i>
              <i class="ri-star-fill"></i>
              <i class="ri-star-fill"></i>
              <i class="ri-star-line"></i>
            </div>
          </div>
          <div class="testimonial">
            <p>
              “Listing my duplex on RealEstatePro helped me find a tenant within
              two weeks. I love how the platform makes communication fast and
              transparent. It's become my go-to for property management.”
            </p>
            <h3>Kemi O. - Port Harcourt</h3>
            <div class="ratings">
              <i class="ri-star-fill"></i>
              <i class="ri-star-fill"></i>
              <i class="ri-star-fill"></i>
              <i class="ri-star-fill"></i>
              <i class="ri-star-line"></i>
            </div>
          </div>
          <div class="testimonial">
            <p>
              “Honestly, RealEstatePro feels like it understands what Nigerians
              really need in a housing platform. It's clean, modern, and doesn't
              waste your time with fake listings.”
            </p>
            <h3>Tunde A. - Property Owner, Abuja</h3>
            <div class="ratings">
              <i class="ri-star-fill"></i>
              <i class="ri-star-fill"></i>
              <i class="ri-star-fill"></i>
              <i class="ri-star-fill"></i>
              <i class="ri-star-fill"></i>
            </div>
          </div>
        </div>
      </section>
      <section class="feedback-section">
        <h2>Share Your Feedback</h2>
         <div class="red-line"></div>
        <p>We'd love to hear from you!</p>
        <form class="feedback-form" id="feedback-form">
          <input type="text" name="name" placeholder="Name" />
          <input type="text" name="email" placeholder="Email" />
          <textarea
            name=""
            id="area"
            placeholder="Message
                "
          ></textarea>
          <button class="feedback-form-btn" id="feedback-form-btn">Submit</button>
        </form>
      </section>
      <section class="cta-about">
        <div class="about-cta-content">
          <h2>Thank You For Being Part A Of RealEstatePro</h2>
          <p>Together, we're redefining real estate experiences.</p>
          <a href="#/" class="cta-about-btn">Back to home</a>
        </div>
      </section>
    </section>
  `;

  const feedbackBtn = document.getElementById("feedback-form-btn");
  const feedbackForm = document.getElementById("feedback-form");

  feedbackForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const feedbackName = feedbackForm.name.value.trim();
    alert(`Thank You for your Feedback, ${feedbackName}!`);

    feedbackForm.reset();
  });
}
