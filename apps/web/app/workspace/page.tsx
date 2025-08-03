// apps/web/app/workspace/page.tsx
export default function WorkspacePage() {
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome to BOAST IT UP
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Your growth hub for social media content management
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Getting Started
            </h3>
            <p className="text-gray-600 mb-4">
              Set up your workspace and configure your first project.
            </p>
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
              Start Setup
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Content Tools
            </h3>
            <p className="text-gray-600 mb-4">
              Access your content creation and management tools.
            </p>
            <button className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors">
              View Tools
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Analytics
            </h3>
            <p className="text-gray-600 mb-4">
              Monitor your performance and growth metrics.
            </p>
            <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors">
              View Analytics
            </button>
          </div>
        </div>

        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="flex flex-wrap gap-4">
            <button className="bg-white text-blue-600 px-4 py-2 rounded-md border border-blue-200 hover:bg-blue-50 transition-colors">
              Create New Project
            </button>
            <button className="bg-white text-blue-600 px-4 py-2 rounded-md border border-blue-200 hover:bg-blue-50 transition-colors">
              Upload Content
            </button>
            <button className="bg-white text-blue-600 px-4 py-2 rounded-md border border-blue-200 hover:bg-blue-50 transition-colors">
              View Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}