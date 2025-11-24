document.addEventListener('DOMContentLoaded', () => {
    const langToggle = document.getElementById('language-toggle');
    const courseDropdown = document.getElementById('course-dropdown');
    const courseDescription = document.getElementById('course-description');

    
    const texts = {
        en: {
            homeTitle: 'Welcome to REES',
            homeText: 'Empowering rural communities through education.'
        },
        rw: {
            homeTitle: 'Murakaza neza muri REES',
            homeText: 'Guteza imbere imiryango yo mu cyaro binyuze mu burezi.'
        }
    };

   
    langToggle.addEventListener('change', (e) => {
        const lang = e.target.value;
        document.getElementById('home-title').textContent = texts[lang].homeTitle;
        document.getElementById('home-text').textContent = texts[lang].homeText;

     
        const selectedOption = courseDropdown.selectedOptions[0];
        if (selectedOption && selectedOption.value) {
            courseDescription.textContent = selectedOption.dataset[`desc${lang.toUpperCase()}`];
        }
    });

    courseDropdown.addEventListener('change', (e) => {
        const lang = langToggle.value;
        const selectedOption = e.target.selectedOptions[0];
        if (selectedOption && selectedOption.value) {
            courseDescription.textContent = selectedOption.dataset[`desc${lang.toUpperCase()}`];
        } else {
            courseDescription.textContent = '';
        }
    });
});

