import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Leaf, Heart, Award, Users, Target, Eye } from "lucide-react"

export default function AboutPage() {
  const values = [
    {
      icon: Leaf,
      title: "Natural & Organic",
      description: "We source only the finest natural and organic products directly from trusted farmers.",
    },
    {
      icon: Heart,
      title: "Health First",
      description: "Your health and wellness are our top priorities in everything we do.",
    },
    {
      icon: Award,
      title: "Premium Quality",
      description: "We maintain the highest quality standards through rigorous testing and selection.",
    },
    {
      icon: Users,
      title: "Customer Focused",
      description: "Our customers are at the heart of our business, driving everything we do.",
    },
  ]

  
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-emerald-50 to-amber-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-stone-800 mb-6">
              About <span className="text-emerald-600">Krishna Naturals</span>
            </h1>
            <p className="text-xl text-stone-600 max-w-3xl mx-auto">
              Bringing you the finest dry fruits, nuts, seeds, and spices from nature's bounty. Our journey began with a
              simple mission: to provide pure, healthy, and delicious natural foods to every home.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-stone-800 mb-6">Our Story</h2>
            <div className="space-y-4 text-stone-600">
              <p>
                Founded in 2010, Krishna Naturals started as a small family business with a passion for bringing the
                finest natural products to health-conscious consumers. What began as a local venture has now grown into
                a trusted brand serving customers across the country.
              </p>
              <p>
                Our founder, Rajesh Sharma, grew up in a farming family and witnessed firsthand the difference that
                quality makes in natural products. This experience inspired him to create a business that would bridge
                the gap between farmers and consumers, ensuring that only the best products reach your table.
              </p>
              <p>
                Today, we work directly with over 200 farmers across India, supporting sustainable farming practices and
                fair trade. Every product in our collection is carefully selected, tested, and packaged to maintain its
                natural goodness and nutritional value.
              </p>
            </div>
          </div>
          <div className="relative">
            <Image
              src="https://res.cloudinary.com/dfv7xsiud/image/upload/v1750242790/DD4_bnpcj0.webp"
              
              alt="Our Story"
              width={600}
              height={400}
              className="rounded-lg shadow-lg object-cover w-full h-full"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-stone-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <Card className="border-none shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Target className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-stone-800 mb-4">Our Mission</h3>
                <p className="text-stone-600">
                  To provide the highest quality natural and organic dry fruits, nuts, seeds, and spices while
                  supporting sustainable farming practices and promoting healthy living for all.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Eye className="h-8 w-8 text-amber-600" />
                </div>
                <h3 className="text-2xl font-bold text-stone-800 mb-4">Our Vision</h3>
                <p className="text-stone-600">
                  To become India's most trusted brand for natural foods, creating a healthier world where everyone has
                  access to pure, nutritious, and sustainably sourced products.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-stone-800 mb-4">Our Values</h2>
          <p className="text-stone-600 text-lg">The principles that guide everything we do</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => {
            const Icon = value.icon
            return (
              <Card key={index} className="text-center border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-stone-800 mb-3">{value.title}</h3>
                  <p className="text-stone-600">{value.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

     
      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-emerald-600 mb-2">200+</div>
            <div className="text-stone-600">Partner Farmers</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-emerald-600 mb-2">50,000+</div>
            <div className="text-stone-600">Happy Customers</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-emerald-600 mb-2">100+</div>
            <div className="text-stone-600">Premium Products</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-emerald-600 mb-2">14+</div>
            <div className="text-stone-600">Years of Excellence</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-emerald-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Natural Food Journey</h2>
          <p className="text-xl mb-8 opacity-90">
            Experience the difference that quality and care make in every product
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/shop"
              className="bg-white text-emerald-600 px-8 py-3 rounded-lg font-semibold hover:bg-stone-100 transition-colors"
            >
              Shop Now
            </a>
            <a
              href="/contact"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-emerald-600 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
