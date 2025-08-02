import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Privacy() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 max-w-sm mx-auto pb-24"
    >
      <div className="flex items-center mb-6">
        <Link href="/settings">
          <Button variant="ghost" size="icon" className="mr-4">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-black dark:text-white">Privacy Policy</h1>
      </div>
      
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Last updated: August 2, 2025
        </p>

        <h2 className="text-lg font-semibold mb-3">Your Privacy Matters</h2>
        <p className="mb-4">
          ProdScale is committed to protecting your privacy. This policy explains how we handle your data.
        </p>

        <h2 className="text-lg font-semibold mb-3">Data Collection</h2>
        <p className="mb-4">
          We collect only the data necessary to provide our productivity tracking service:
        </p>
        <ul className="list-disc pl-5 mb-4 space-y-2">
          <li>Activity completion data</li>
          <li>Daily reflections and scores</li>
          <li>Usage patterns for improving the app</li>
        </ul>

        <h2 className="text-lg font-semibold mb-3">Data Storage</h2>
        <p className="mb-4">
          Your data is stored securely and never shared with third parties. All data is encrypted in transit and at rest.
        </p>

        <h2 className="text-lg font-semibold mb-3">Data Control</h2>
        <p className="mb-4">
          You have full control over your data:
        </p>
        <ul className="list-disc pl-5 mb-4 space-y-2">
          <li>Export your data anytime (Pro feature)</li>
          <li>Delete your account and all associated data</li>
          <li>Modify or remove any information</li>
        </ul>

        <h2 className="text-lg font-semibold mb-3">Contact</h2>
        <p className="mb-4">
          For privacy concerns, please contact us through the Contact Us page.
        </p>
      </div>
    </motion.div>
  );
}