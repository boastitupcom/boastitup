import { Button }  from '@boastitup/ui';
import { Badge } from  '@boastitup/ui';
import { ArrowRight, Sparkles, TrendingUp, Zap, Target, BarChart3, Users } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-green-50">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-black/[0.02] bg-[size:50px_50px]" />
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-emerald-200/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-200/20 rounded-full blur-3xl" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <Image
                src="/boast-it-up-logo.png"
                alt="BOAST IT UP Logo"
                width={200}
                height={80}
                className="h-20 w-auto"
                priority
              />
            </div>
          </div>

          {/* Badge */}
          <div className="flex justify-center">
            <Badge variant="secondary" className="px-4 py-2 text-sm font-medium bg-emerald-100 text-emerald-800 border-emerald-200">
              <Sparkles className="w-4 h-4 mr-2" />
              The Ultimate Growth Marketing Platform
            </Badge>
          </div>

          {/* Main Headline */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="block text-gray-900">
                Ready to
              </span>
              <span className="block bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 bg-clip-text text-transparent">
                BOAST IT UP?
              </span>
            </h1>
            
            <p className="max-w-3xl mx-auto text-xl sm:text-2xl text-gray-600 leading-relaxed">
              Transform your marketing game with AI-powered content creation, 
              data-driven insights, and growth strategies that make your competitors jealous.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Button 
              asChild 
              size="lg" 
              className="text-lg px-8 py-6 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Link href="/auth/sign-up">
                Start Boasting Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            
            <Button 
              asChild 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-6 border-2 border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50"
            >
              <Link href="#features">
                See What We Offer
              </Link>
            </Button>
          </div>

          {/* Social Proof */}
          <div className="pt-12">
            <p className="text-sm text-gray-500 mb-6">Trusted by growth marketers worldwide</p>
            <div className="flex justify-center items-center space-x-8 text-gray-400">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span className="text-sm font-medium">10,000+ Users</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span className="text-sm font-medium">2M+ Content Pieces</span>
              </div>
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span className="text-sm font-medium">150% Avg Growth</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-green-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative p-6 bg-white ring-1 ring-gray-900/5 rounded-lg leading-none flex items-top justify-start space-x-6">
              <Zap className="w-8 h-8 text-emerald-600" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">AI-Powered Content</h3>
                <p className="text-gray-600">Generate high-converting content that actually works</p>
              </div>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-green-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative p-6 bg-white ring-1 ring-gray-900/5 rounded-lg leading-none flex items-top justify-start space-x-6">
              <Target className="w-8 h-8 text-emerald-600" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Growth Analytics</h3>
                <p className="text-gray-600">Track what matters and optimize for real results</p>
              </div>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-green-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative p-6 bg-white ring-1 ring-gray-900/5 rounded-lg leading-none flex items-top justify-start space-x-6">
              <BarChart3 className="w-8 h-8 text-emerald-600" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Smart Automation</h3>
                <p className="text-gray-600">Scale your marketing while you sleep</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-lg text-gray-600 mb-4">
            Ready to leave your competition in the dust?
          </p>
          <Button 
            asChild 
            variant="ghost" 
            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
          >
            <Link href="/auth/sign-up">
              Join the growth revolution →
            </Link>
          </Button>
        </div>
      </div>

      {/* Animated Elements */}
      <div className="absolute top-20 left-10 animate-bounce">
        <div className="w-3 h-3 bg-emerald-400 rounded-full opacity-60"></div>
      </div>
      <div className="absolute top-40 right-20 animate-pulse">
        <div className="w-2 h-2 bg-green-400 rounded-full opacity-40"></div>
      </div>
      <div className="absolute bottom-40 left-20 animate-ping">
        <div className="w-1 h-1 bg-emerald-500 rounded-full opacity-30"></div>
      </div>
    </section>
  );
}