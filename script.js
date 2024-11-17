
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle functionality
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');
    
    menuToggle.addEventListener('click', function() {
        nav.classList.toggle('active');
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Contact form submission
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    function setFormStatus(message, type) {
        formStatus.textContent = message;
        formStatus.className = type;
    }

    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        if (validateForm()) {
            setFormStatus('Sending...', 'loading');

            const formData = new FormData(contactForm);
            const name = formData.get('name');
            const email = formData.get('email');
            const message = formData.get('message');

            fetch('https://3000-iur9f4szaqwlji2blomn3r-d6041615.e2b.dev/submit-form', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, message }),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    setFormStatus('Thank you for your message. We will get back to you soon!', 'success');
                    contactForm.reset();
                } else {
                    setFormStatus('There was an error submitting the form. Please try again.', 'error');
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                setFormStatus('There was an error submitting the form. Please try again.', 'error');
            });
        }
    });
});
