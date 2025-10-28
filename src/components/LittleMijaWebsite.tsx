import { useState } from 'react';
import { ShoppingCart, Heart, Star, Package, TrendingUp, Truck, Mail, Phone, MapPin, Facebook, Instagram, Twitter, User, LogOut, UserCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import logoImage from 'figma:asset/086cf3cc9a736a513ded11d47e82ce484a90947a.png';

interface LittleMijaWebsiteProps {
  onSignupClick: () => void;
  onLoginClick: () => void;
  cart: any[];
  onAddToCart: (product: any) => void;
  onViewCart: () => void;
  currentUser?: any;
  onLogout: () => void;
}

export function LittleMijaWebsite({ onSignupClick, onLoginClick, cart, onAddToCart, onViewCart, currentUser, onLogout }: LittleMijaWebsiteProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    {
      id: 'boys',
      name: 'Baby Boys',
      icon: '👶',
      color: 'bg-blue-100 text-blue-600',
      borderColor: 'border-blue-200'
    },
    {
      id: 'girls',
      name: 'Baby Girls',
      icon: '👧',
      color: 'bg-pink-100 text-pink-600',
      borderColor: 'border-pink-200'
    },
    {
      id: 'new',
      name: 'New Arrivals',
      icon: '✨',
      color: 'bg-yellow-100 text-yellow-600',
      borderColor: 'border-yellow-200'
    },
    {
      id: 'bestseller',
      name: 'Best Sellers',
      icon: '⭐',
      color: 'bg-purple-100 text-purple-600',
      borderColor: 'border-purple-200'
    }
  ];

  const products = [
    {
      id: 1,
      name: 'Soft Cotton Onesie',
      price: 299,
      category: 'boys',
      image: 'https://images.unsplash.com/photo-1545877872-3e6582cbc37c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
      rating: 5,
      tag: 'bestseller'
    },
    {
      id: 2,
      name: 'Pink Floral Dress',
      price: 450,
      category: 'girls',
      image: 'https://images.unsplash.com/photo-1625485818856-e3a60c52de26?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
      rating: 5,
      tag: 'new'
    },
    {
      id: 3,
      name: 'Blue Romper Set',
      price: 380,
      category: 'boys',
      image: 'https://images.unsplash.com/photo-1758513422921-3a410afab2b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
      rating: 4,
      tag: null
    },
    {
      id: 4,
      name: 'Pastel Baby Bundle',
      price: 599,
      category: 'girls',
      image: 'https://images.unsplash.com/photo-1727508301649-c9397bb63dde?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
      rating: 5,
      tag: 'bestseller'
    },
    {
      id: 5,
      name: 'Newborn Essentials Pack',
      price: 750,
      category: 'boys',
      image: 'https://images.unsplash.com/photo-1692477122828-8871a6f2693c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
      rating: 5,
      tag: 'new'
    },
    {
      id: 6,
      name: 'Soft Knit Baby Outfit',
      price: 420,
      category: 'girls',
      image: 'https://images.unsplash.com/photo-1746386914795-83d2febc9a96?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
      rating: 4,
      tag: null
    },
    {
      id: 7,
      name: 'Striped Bodysuit Set',
      price: 350,
      category: 'boys',
      image: 'https://images.unsplash.com/photo-1545877872-3e6582cbc37c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
      rating: 5,
      tag: 'bestseller'
    },
    {
      id: 8,
      name: 'Sweet Dreams Sleepwear',
      price: 399,
      category: 'girls',
      image: 'https://images.unsplash.com/photo-1625485818856-e3a60c52de26?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
      rating: 5,
      tag: 'new'
    },
    {
      id: 9,
      name: 'Cozy Winter Set',
      price: 680,
      category: 'boys',
      image: 'https://images.unsplash.com/photo-1758513422921-3a410afab2b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
      rating: 4,
      tag: null
    },
    {
      id: 10,
      name: 'Princess Tutu Dress',
      price: 550,
      category: 'girls',
      image: 'https://images.unsplash.com/photo-1625485818856-e3a60c52de26?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
      rating: 5,
      tag: 'bestseller'
    },
    {
      id: 11,
      name: 'Little Gentleman Set',
      price: 620,
      category: 'boys',
      image: 'https://images.unsplash.com/photo-1758513422921-3a410afab2b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
      rating: 5,
      tag: 'new'
    },
    {
      id: 12,
      name: 'Bow & Ruffle Outfit',
      price: 480,
      category: 'girls',
      image: 'https://images.unsplash.com/photo-1727508301649-c9397bb63dde?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
      rating: 4,
      tag: null
    }
  ];

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : selectedCategory === 'new' 
      ? products.filter(p => p.tag === 'new')
      : selectedCategory === 'bestseller'
        ? products.filter(p => p.tag === 'bestseller')
        : products.filter(p => p.category === selectedCategory);

  const handleAddToCart = (product: any) => {
    onAddToCart(product);
    toast.success(`${product.name} added to cart!`, {
      description: `₱${product.price} - Click the cart icon to checkout`
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf3f0] via-[#fef7f3] to-[#fff9f5] font-['Poppins',sans-serif]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b-2 border-[#d4a5a5]/20 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img src={logoImage} alt="Little Mija" className="h-14 w-14 rounded-full object-cover" />
              <div className="hidden sm:block">
                <div className="text-xl font-bold text-[#7d5a50]">Little Mija</div>
                <div className="text-xs text-[#a67c6d]">Branded Baby Clothing</div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <a href="#home" className="text-[#7d5a50] hover:text-[#d4a5a5] transition-colors">Home</a>
              <a href="#shop" className="text-[#7d5a50] hover:text-[#d4a5a5] transition-colors">Shop</a>
              <a href="#about" className="text-[#7d5a50] hover:text-[#d4a5a5] transition-colors">About</a>
              <a href="#wholesale" className="text-[#7d5a50] hover:text-[#d4a5a5] transition-colors">Wholesale</a>
              <a href="#contact" className="text-[#7d5a50] hover:text-[#d4a5a5] transition-colors">Contact</a>
            </nav>

            {/* Cart & User Menu */}
            <div className="flex items-center gap-2">
              {/* Desktop User Menu */}
              {currentUser ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="hidden md:flex items-center gap-2 text-[#7d5a50] hover:text-[#d4a5a5] hover:bg-pink-50 rounded-full px-4"
                    >
                      <UserCircle className="h-5 w-5" />
                      <span className="max-w-[100px] truncate">{currentUser.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-white shadow-lg border-2 border-[#d4a5a5]/20">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-semibold text-[#7d5a50]">{currentUser.name}</p>
                        <p className="text-xs text-[#a67c6d]">{currentUser.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer text-[#7d5a50] focus:bg-pink-50 focus:text-[#7d5a50]" onClick={onViewCart}>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      My Cart
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer text-[#7d5a50] focus:bg-pink-50 focus:text-[#7d5a50]" onClick={onLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  variant="ghost" 
                  onClick={onLoginClick}
                  className="hidden md:flex items-center gap-2 text-[#7d5a50] hover:text-[#d4a5a5] hover:bg-pink-50 rounded-full px-4"
                >
                  <User className="h-4 w-4" />
                  <span>Login</span>
                </Button>
              )}

              {/* Mobile User Icon */}
              {currentUser ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="md:hidden relative rounded-full hover:bg-pink-100"
                    >
                      <UserCircle className="h-5 w-5 text-[#d4a5a5]" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-white shadow-lg border-2 border-[#d4a5a5]/20">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-semibold text-[#7d5a50]">{currentUser.name}</p>
                        <p className="text-xs text-[#a67c6d]">{currentUser.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer text-[#7d5a50] focus:bg-pink-50 focus:text-[#7d5a50]" onClick={onViewCart}>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      My Cart
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer text-[#7d5a50] focus:bg-pink-50 focus:text-[#7d5a50]" onClick={onLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={onLoginClick}
                  className="md:hidden relative rounded-full hover:bg-pink-100"
                >
                  <User className="h-5 w-5 text-[#d4a5a5]" />
                </Button>
              )}

              <Button variant="ghost" size="icon" className="hidden md:flex relative rounded-full hover:bg-pink-100">
                <Heart className="h-5 w-5 text-[#d4a5a5]" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative rounded-full hover:bg-pink-100"
                onClick={onViewCart}
              >
                <ShoppingCart className="h-5 w-5 text-[#d4a5a5]" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#f8bbd0] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="relative overflow-hidden py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block">
                <Badge className="bg-[#fff4e6] text-[#ff9a8b] border-[#ffb4a8] px-4 py-1 rounded-full">
                  ✨ Trusted by 1000+ Parents
                </Badge>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#7d5a50] leading-tight">
                Branded Baby Clothing
                <span className="block text-[#f8bbd0]">Wholesale</span>
              </h1>
              <p className="text-lg text-[#a67c6d] max-w-lg">
                Affordable, high-quality branded clothing for your little ones. Perfect for parents and small resellers.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button className="bg-gradient-to-r from-[#f8bbd0] to-[#ffc1e3] hover:from-[#f48fb1] hover:to-[#f8bbd0] text-white px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all">
                  Shop Now
                </Button>
                <Button variant="outline" className="border-2 border-[#d4a5a5] text-[#7d5a50] px-8 py-6 rounded-full hover:bg-[#fef7f3]">
                  Wholesale Signup
                </Button>
              </div>
              <div className="flex items-center gap-8 pt-4">
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-[#81d4fa]" />
                  <span className="text-sm text-[#a67c6d]">Free Shipping</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-[#fff59d]" />
                  <span className="text-sm text-[#a67c6d]">Secure Packaging</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-[#ce93d8]" />
                  <span className="text-sm text-[#a67c6d]">Best Deals</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1727508301649-c9397bb63dde?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800"
                  alt="Baby clothing collection"
                  className="w-full h-[400px] md:h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#7d5a50]/20 to-transparent"></div>
              </div>
              {/* Floating decorative elements */}
              <div className="absolute -top-4 -right-4 bg-[#fff4e6] rounded-full p-4 shadow-lg animate-bounce">
                <Star className="h-8 w-8 text-[#fff59d]" fill="currentColor" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-full p-4 shadow-lg">
                <Heart className="h-8 w-8 text-[#f8bbd0]" fill="currentColor" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 bg-white/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#7d5a50] mb-3">Shop by Category</h2>
            <p className="text-[#a67c6d]">Find the perfect outfit for your little one</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Card
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`p-6 rounded-2xl border-2 ${category.borderColor} ${
                  selectedCategory === category.id ? category.color : 'bg-white hover:bg-gray-50'
                } cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 group`}
              >
                <div className="text-center space-y-3">
                  <div className={`text-4xl md:text-5xl mx-auto w-16 h-16 rounded-2xl ${category.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    {category.icon}
                  </div>
                  <h3 className="font-semibold text-[#7d5a50]">{category.name}</h3>
                </div>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button
              variant="outline"
              onClick={() => setSelectedCategory('all')}
              className={`rounded-full border-2 ${
                selectedCategory === 'all' ? 'bg-[#f8bbd0] text-white border-[#f8bbd0]' : 'border-[#d4a5a5] text-[#7d5a50]'
              }`}
            >
              View All Products
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border-2 border-[#d4a5a5]/20">
              <div className="text-center mb-8">
                <img src={logoImage} alt="Little Mija Logo" className="h-24 w-24 mx-auto mb-4 rounded-full shadow-lg" />
                <h2 className="text-3xl md:text-4xl font-bold text-[#7d5a50] mb-4">About Little Mija</h2>
              </div>
              <div className="space-y-6 text-center md:text-left">
                <p className="text-lg text-[#a67c6d] leading-relaxed">
                  At <span className="font-semibold text-[#7d5a50]">Little Mija</span>, we believe every baby deserves to wear quality, branded clothing that's both comfortable and affordable. Our mission is to provide parents and small resellers with access to premium baby clothing at wholesale prices.
                </p>
                <p className="text-lg text-[#a67c6d] leading-relaxed">
                  We carefully curate our collection to ensure that every piece meets our high standards of quality, comfort, and style. From soft cotton onesies to adorable dresses, our products are designed with your little one's happiness in mind.
                </p>
                <div className="grid md:grid-cols-3 gap-6 pt-6">
                  <div className="text-center p-6 bg-[#fff4e6] rounded-2xl">
                    <div className="text-3xl font-bold text-[#f8bbd0]">1000+</div>
                    <div className="text-sm text-[#a67c6d] mt-2">Happy Customers</div>
                  </div>
                  <div className="text-center p-6 bg-[#e3f2fd] rounded-2xl">
                    <div className="text-3xl font-bold text-[#81d4fa]">500+</div>
                    <div className="text-sm text-[#a67c6d] mt-2">Products Available</div>
                  </div>
                  <div className="text-center p-6 bg-[#f3e5f5] rounded-2xl">
                    <div className="text-3xl font-bold text-[#ce93d8]">100%</div>
                    <div className="text-sm text-[#a67c6d] mt-2">Quality Guaranteed</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Grid Section */}
      <section id="shop" className="py-16 bg-white/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#7d5a50] mb-3">Our Products</h2>
            <p className="text-[#a67c6d]">Handpicked with love for your little ones</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="group rounded-2xl overflow-hidden border-2 border-[#d4a5a5]/20 hover:border-[#f8bbd0] hover:shadow-xl transition-all duration-300 bg-white">
                <div className="relative overflow-hidden">
                  <ImageWithFallback
                    src={product.image}
                    alt={product.name}
                    className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {product.tag && (
                    <Badge className={`absolute top-3 right-3 ${
                      product.tag === 'new' 
                        ? 'bg-[#fff59d] text-[#f57f17]' 
                        : 'bg-[#ce93d8] text-white'
                    } rounded-full px-3 py-1`}>
                      {product.tag === 'new' ? '✨ New' : '⭐ Best Seller'}
                    </Badge>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-3 left-3 bg-white/90 hover:bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Heart className="h-4 w-4 text-[#f8bbd0]" />
                  </Button>
                </div>
                <div className="p-4 space-y-3">
                  <h3 className="font-semibold text-[#7d5a50] line-clamp-1">{product.name}</h3>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < product.rating ? 'text-[#fff59d] fill-[#fff59d]' : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-xs text-[#a67c6d] ml-1">({product.rating}.0)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-[#f8bbd0]">₱{product.price}</span>
                    <Button
                      size="sm"
                      onClick={() => handleAddToCart(product)}
                      className="bg-gradient-to-r from-[#f8bbd0] to-[#ffc1e3] hover:from-[#f48fb1] hover:to-[#f8bbd0] text-white rounded-full px-4"
                    >
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Wholesale Section */}
      <section id="wholesale" className="py-16">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-br from-[#f8bbd0] via-[#ffc1e3] to-[#ce93d8] rounded-3xl shadow-2xl p-8 md:p-12 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
              <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white rounded-full"></div>
            </div>
            <div className="relative z-10 max-w-3xl mx-auto space-y-6">
              <Package className="h-16 w-16 mx-auto mb-4" />
              <h2 className="text-3xl md:text-4xl font-bold">Join Our Wholesale Program</h2>
              <p className="text-lg text-white/90 max-w-2xl mx-auto">
                Are you a reseller? Get access to exclusive wholesale pricing and grow your business with Little Mija. Enjoy bulk discounts, priority shipping, and dedicated support.
              </p>
              <div className="grid md:grid-cols-3 gap-6 pt-6">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                  <div className="text-4xl mb-2">📦</div>
                  <h3 className="font-semibold mb-2">Bulk Discounts</h3>
                  <p className="text-sm text-white/80">Save up to 40% on wholesale orders</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                  <div className="text-4xl mb-2">🚚</div>
                  <h3 className="font-semibold mb-2">Fast Shipping</h3>
                  <p className="text-sm text-white/80">Priority delivery for all wholesale orders</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                  <div className="text-4xl mb-2">💬</div>
                  <h3 className="font-semibold mb-2">Dedicated Support</h3>
                  <p className="text-sm text-white/80">Personal account manager for your business</p>
                </div>
              </div>
              <Button className="bg-white text-[#f8bbd0] hover:bg-gray-100 px-8 py-6 rounded-full font-semibold text-lg shadow-lg mt-8">
                Sign Up for Wholesale
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-[#7d5a50] text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img src={logoImage} alt="Little Mija" className="h-12 w-12 rounded-full" />
                <div>
                  <div className="font-bold text-lg">Little Mija</div>
                  <div className="text-xs text-white/70">Branded Baby Clothing</div>
                </div>
              </div>
              <p className="text-sm text-white/80">
                Quality baby clothing at wholesale prices. Trusted by parents and resellers nationwide.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-white/80">
                <li><a href="#home" className="hover:text-white transition-colors">Home</a></li>
                <li><a href="#shop" className="hover:text-white transition-colors">Shop</a></li>
                <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#wholesale" className="hover:text-white transition-colors">Wholesale</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Customer Service</h3>
              <ul className="space-y-2 text-sm text-white/80">
                <li><a href="#" className="hover:text-white transition-colors">Shipping Info</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Returns</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Size Guide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQs</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contact Us</h3>
              <ul className="space-y-3 text-sm text-white/80">
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>+63 912 345 6789</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>hello@littlemija.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>Manila, Philippines</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-white/70">
                © 2024 Little Mija. All rights reserved.
              </p>
              <div className="flex items-center gap-4">
                <a href="#" className="hover:text-[#f8bbd0] transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="hover:text-[#f8bbd0] transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="hover:text-[#f8bbd0] transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}