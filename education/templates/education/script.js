const languageToggle = document.getElementById("language-toggle");
const dashboardTitle = document.getElementById("dashboard-title");
const homeTitle = document.getElementById("home-title");
const homeText = document.getElementById("home-text");
const courseDropdown = document.getElementById("course-dropdown");
const courseDescription = document.getElementById("course-description");

languageToggle.addEventListener("change", updateLanguage);
courseDropdown.addEventListener("change", updateLanguage);

function updateLanguage() {
    const lang = languageToggle.value;

    dashboardTitle.textContent = (lang === 'en') ? "Rural Education Empowerment System" : "Sisitemu yo Gutoza no Guteza Imbere Amasomo mu Cyaro";
    homeTitle.textContent = (lang === 'en') ? "Welcome to REES" : "Murakaza neza muri REES";
    homeText.textContent = (lang === 'en') ? "Empowering rural communities through education." : "Guteza imbere abaturage bo mu cyaro binyuze mu masomo.";

    const selectedCourse = courseDropdown.selectedOptions[0];
    if (selectedCourse && selectedCourse.value !== "") {
        courseDescription.textContent = selectedCourse.dataset[`desc${lang.toUpperCase()}`];
    } else {
        courseDescription.textContent = "";
    }
}

