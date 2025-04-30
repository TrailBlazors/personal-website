document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('nav');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            nav.style.display = nav.style.display === 'block' ? 'none' : 'block';
        });
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                if (window.innerWidth <= 768) {
                    nav.style.display = 'none';
                }
            }
        });
    });
    
    // Load articles from markdown files
    loadArticles();
    
    // Contact form handling
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // In a real implementation, you would send the form data to a server
            // For now, we'll just show an alert
            alert('Thank you for your message! In a real implementation, this would be sent to a server.');
            contactForm.reset();
        });
    }
});

// Function to load articles from markdown files
async function loadArticles() {
    const articlesContainer = document.getElementById('articles-container');
    if (!articlesContainer) return;
    
    try {
        // Fetch the article index (this would be a JSON file listing all your articles)
        const response = await fetch('articles/index.json');
        const articles = await response.json();
        
        // Sort articles by date (newest first)
        articles.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Display the articles
        articles.forEach(article => {
            fetchAndRenderArticle(article, articlesContainer);
        });
    } catch (error) {
        console.error('Error loading articles:', error);
        articlesContainer.innerHTML = '<p>Failed to load articles. Please try again later.</p>';
    }
}

async function fetchAndRenderArticle(article, container) {
    try {
        // Fetch the markdown content
        const response = await fetch(`articles/${article.file}`);
        const markdown = await response.text();
        
        // Convert markdown to HTML
        const htmlContent = marked.parse(markdown);
        
        // Create article card
        const articleCard = document.createElement('div');
        articleCard.className = 'article-card';
        
        // Create article HTML structure
        articleCard.innerHTML = `
            <div class="article-image">
                <img src="${article.image || 'images/article-placeholder.jpg'}" alt="${article.title}">
            </div>
            <div class="article-content">
                <div class="article-date">${formatDate(article.date)}</div>
                <h3>${article.title}</h3>
                <p>${article.excerpt}</p>
                <a href="article.html?id=${article.id}" class="read-more">Read More</a>
            </div>
        `;
        
        // Add to container
        container.appendChild(articleCard);
    } catch (error) {
        console.error(`Error loading article ${article.id}:`, error);
    }
}

// Helper function to format dates
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Function to get URL parameters (for article.html)
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Load individual article on article.html page
async function loadSingleArticle() {
    const articleContainer = document.getElementById('article-content');
    if (!articleContainer) return;
    
    const articleId = getUrlParameter('id');
    if (!articleId) {
        articleContainer.innerHTML = '<p>Article not found.</p>';
        return;
    }
    
    try {
        // Fetch the article index
        const response = await fetch('articles/index.json');
        const articles = await response.json();
        
        // Find the requested article
        const article = articles.find(a => a.id === articleId);
        if (!article) {
            articleContainer.innerHTML = '<p>Article not found.</p>';
            return;
        }
        
        // Fetch the markdown content
        const markdownResponse = await fetch(`articles/${article.file}`);
        const markdown = await markdownResponse.text();
        
        // Convert markdown to HTML
        const htmlContent = marked.parse(markdown);
        
        // Update page title
        document.title = `${article.title} - Your Name`;
        
        // Update article header
        const articleHeader = document.querySelector('.article-header');
        if (articleHeader) {
            articleHeader.innerHTML = `
                <h1>${article.title}</h1>
                <div class="article-meta">
                    <span class="article-date">${formatDate(article.date)}</span>
                </div>
            `;
        }
        
        // Set the article content
        articleContainer.innerHTML = htmlContent;
    } catch (error) {
        console.error('Error loading article:', error);
        articleContainer.innerHTML = '<p>Failed to load article. Please try again later.</p>';
    }
}

// Check if we're on the article page and load the article
if (window.location.pathname.includes('article.html')) {
    document.addEventListener('DOMContentLoaded', loadSingleArticle);
}
