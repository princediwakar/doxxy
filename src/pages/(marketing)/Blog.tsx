import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Clock, 
  User, 
  BookOpen, 
  Video, 
  Download,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SignupCTA from "@/components/SignupCTA";
import SiteFooter from "@/components/SiteFooter";

const Blog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Content' },
    { id: 'technology', name: 'Healthcare Technology' },
    { id: 'compliance', name: 'Compliance & Security' },
    { id: 'patient-care', name: 'Patient Care' },
    { id: 'practice-management', name: 'Practice Management' },
    { id: 'telemedicine', name: 'Telemedicine' }
  ];

  const featuredPosts = [
    
    {
      id: 2,
      title: "How AI is Transforming Healthcare Practice Management",
      excerpt: "Explore how artificial intelligence is revolutionizing appointment scheduling, patient care, and administrative tasks.",
      category: "technology",
      author: "Rajesh Kumar",
      readTime: "8 min read",
      publishDate: "2024-01-10",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=400&fit=crop",
      featured: true
    }
  ];

  const blogPosts = [
    {
      id: 3,
      title: "10 Best Practices for Telemedicine Success",
      excerpt: "Essential tips for implementing and optimizing telemedicine in your healthcare practice.",
      category: "telemedicine",
      author: "Dr. Maria Rodriguez",
      readTime: "6 min read",
      publishDate: "2024-01-08",
      image: "https://images.unsplash.com/photo-1576671081837-49000212a370?w=400&h=250&fit=crop"
    },
    {
      id: 4,
      title: "Patient Data Security: A Comprehensive Checklist",
      excerpt: "Step-by-step guide to securing patient data and preventing healthcare data breaches.",
      category: "compliance",
      author: "Amit Patel",
      readTime: "10 min read",
      publishDate: "2024-01-05",
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=250&fit=crop"
    },
    {
      id: 5,
      title: "Improving Patient Experience with Digital Health Tools",
      excerpt: "How modern healthcare technology can enhance patient satisfaction and outcomes.",
      category: "patient-care",
      author: "Dr. Priya Sharma",
      readTime: "7 min read",
      publishDate: "2024-01-02",
      image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=250&fit=crop"
    },
    {
      id: 6,
      title: "Revenue Cycle Management: Optimization Strategies",
      excerpt: "Proven strategies to improve billing efficiency and reduce revenue leakage in healthcare practices.",
      category: "practice-management",
      author: "Vikram Singh",
      readTime: "9 min read",
      publishDate: "2023-12-28",
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=250&fit=crop"
    },
    {
      id: 7,
      title: "Multi-Clinic Management: Scaling Your Practice",
      excerpt: "Best practices for managing multiple healthcare locations efficiently and effectively.",
      category: "practice-management",
      author: "Dr. Sarah Johnson",
      readTime: "11 min read",
      publishDate: "2023-12-25",
      image: "https://images.unsplash.com/photo-1504439468489-c8920d796a29?w=400&h=250&fit=crop"
    },
    {
      id: 8,
      title: "Healthcare Analytics: Making Data-Driven Decisions",
      excerpt: "How to leverage healthcare analytics to improve practice operations and patient outcomes.",
      category: "technology",
      author: "Rajesh Kumar",
      readTime: "8 min read",
      publishDate: "2023-12-22",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop"
    }
  ];

  const slugMap: Record<number, string> = {
    2: "ai-transforming-healthcare-management",
    3: "telemedicine-best-practices",
    4: "patient-data-security-checklist",
    5: "improving-patient-experience-digital-tools",
    6: "revenue-cycle-management-strategies",
    7: "multi-clinic-management-scaling-practice",
    8: "healthcare-analytics-data-driven-decisions",
  } as const;

  const resources = [
    
    {
      title: "Telemedicine Implementation Webinar",
      description: "60-minute webinar on successfully implementing telemedicine in your practice",
      type: "Video",
      icon: <Video className="h-6 w-6" />
    },
    {
      title: "Practice Management Templates",
      description: "Ready-to-use templates for patient intake, consent forms, and workflows",
      type: "Templates",
      icon: <Download className="h-6 w-6" />
    },
    {
      title: "Healthcare Technology Trends Report",
      description: "Annual report on emerging trends in healthcare technology and digital health",
      type: "Report",
      icon: <BookOpen className="h-6 w-6" />
    }
  ];


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 pt-32">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="outline" className="mb-4 px-4 py-2">
            Resources & Insights
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Healthcare
            <span className="text-primary"> Knowledge Hub</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Stay updated with the latest trends, best practices, and insights in healthcare technology. 
            Expert content to help you optimize your practice and improve patient care.
          </p>
          
          {/* Search and Filter */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  placeholder="Search articles and resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 py-3"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <Badge
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    className="cursor-pointer px-4 py-2"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.filter(post => 
        selectedCategory === 'all' || post.category === selectedCategory
      ).length > 0 && (
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
                          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">Featured Articles</h2>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {featuredPosts
                .filter(post => selectedCategory === 'all' || post.category === selectedCategory)
                .map(post => (
                <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-w-16 aspect-h-9">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-64 object-cover"
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="secondary">
                        {categories.find(c => c.id === post.category)?.name}
                      </Badge>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {post.readTime}
                        </span>
                        <span>{formatDate(post.publishDate)}</span>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-foreground mb-3">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{post.author}</span>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/blog/${slugMap[post.id]}`}>Read More <ArrowRight className="h-4 w-4 ml-2" /></Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Regular Blog Posts */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
                        <h2 className="text-3xl font-bold text-foreground mb-12 text-center">Latest Articles</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts
              .filter(post => {
                const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                   post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
                return matchesSearch && matchesCategory;
              })
              .map(post => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-w-16 aspect-h-9">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="secondary" className="text-xs">
                      {categories.find(c => c.id === post.category)?.name}
                    </Badge>
                                          <span className="text-xs text-muted-foreground">{formatDate(post.publishDate)}</span>
                  </div>
                  
                                      <h3 className="text-lg font-bold text-foreground mb-3 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{post.author}</span>
                      <Clock className="h-3 w-3 text-muted-foreground ml-2" />
                      <span className="text-xs text-muted-foreground">{post.readTime}</span>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/blog/${slugMap[post.id]}`}>Read More <ArrowRight className="h-4 w-4" /></Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Resources Section */}
              <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Free Resources
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Download our comprehensive guides, templates, and tools to help you optimize your healthcare practice.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {resources.map((resource, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit text-primary">
                  {resource.icon}
                </div>
                                  <h3 className="font-semibold text-foreground mb-2">{resource.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{resource.description}</p>
                <Badge variant="outline" className="mb-4">{resource.type}</Badge>
                <Button variant="outline" size="sm" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto text-center text-secondary ">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Stay Updated
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Subscribe to our newsletter for the latest healthcare technology insights, 
            best practices, and product updates delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Input 
              placeholder="Enter your email" 
              className="bg-background text-foreground"
            />
            <Button variant="secondary" size="lg">
              Subscribe
            </Button>
          </div>
        </div>
      </section>

      <SignupCTA />
      <SiteFooter />
    </div>
  );
};

export default Blog; 