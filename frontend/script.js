document.addEventListener("DOMContentLoaded", function() {
    const languageToggle = document.getElementById("language-toggle");
    const courseDropdown = document.getElementById("course-dropdown");
    const courseDescription = document.getElementById("course-description");
    const lessonList = document.getElementById("lesson-list");

    const navLinks = document.querySelectorAll(".nav-link");
    const sections = document.querySelectorAll("main section");

    // Switch between sections (Home, Courses, Lessons)
    navLinks.forEach(link => {
        link.addEventListener("click", function(e) {
            e.preventDefault();
            const target = this.dataset.section;

            sections.forEach(sec => {
                sec.classList.remove("active-section");
            });

            document.getElementById(target).classList.add("active-section");
        });
    });

    // Function to update language
    function updateLanguage() {
        const lang = languageToggle.value;

        // Update course description
        const selectedCourse = courseDropdown.selectedOptions[0];
        if (selectedCourse && selectedCourse.value !== "") {
            courseDescription.textContent = selectedCourse.dataset[`desc${lang.toUpperCase()}`];
        } else {
            courseDescription.textContent = "";
        }

        // Update lesson titles
        lessonList.querySelectorAll("li").forEach(item => {
            item.textContent = item.dataset[`title${lang.toUpperCase()}`];
        });

        // Update static headings
        document.getElementById("dashboard-title").textContent = (lang === 'en') ? "Rural Education Empowerment System" : "Sisitemu yo Gutoza no Guteza Imbere Amasomo mu Cyaro";
        document.getElementById("home-title").textContent = (lang === 'en') ? "Welcome to REES" : "Murakaza neza muri REES";
        document.getElementById("home-text").textContent = (lang === 'en') ? "Empowering rural communities through education." : "Guteza imbere abaturage bo mu cyaro binyuze mu masomo.";
        document.getElementById("courses-title").textContent = (lang === 'en') ? "Courses" : "Amasomo";
        document.getElementById("lessons-title").textContent = (lang === 'en') ? "Lessons" : "Ibyigisho";
    }

    // On language change or course change
    languageToggle.addEventListener("change", updateLanguage);
    courseDropdown.addEventListener("change", updateLanguage);

    // Initialize language
    updateLanguage();
});

