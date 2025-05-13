// Import necessary components and functions from react-router-dom.

import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { ForgotPassword } from "./pages/ForgotPassword";
import SyncSpin from "./pages/SyncSpin";
import Itinerary from "./pages/Itinerary";
import { LandingPage } from "./pages/Landing";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Hotels } from "./pages/Hotels";
import { Attractions } from "./pages/Attractions";
import SharedItinerary from "./pages/SharedItinerary";
import { AboutUs } from "./pages/AboutUs";
import { AccountSettings } from "./pages/AccountSettings";

export const router = createBrowserRouter(
  createRoutesFromElements(
    // CreateRoutesFromElements function allows you to build route elements declaratively.
    // Create your routes here, if you want to keep the Navbar and Footer in all views, add your new routes inside the containing Route.
    // Root, on the contrary, create a sister Route, if you have doubts, try it!
    // Note: keep in mind that errorElement will be the default page when you don't get a route, customize that page to make your project more attractive.
    // Note: The child paths of the Layout element replace the Outlet component with the elements contained in the "element" attribute of these child paths.

    // Root Route: All navigation will start from here.
    <Route path="/" element={<Layout />} >
      <Route index element={<LandingPage />} />
      <Route path="login" element={<Login />} />
      <Route path="syncspin" element={<SyncSpin />} />
      <Route path="signup" element={<Signup />} />
      <Route path="forgotpassword" element={<ForgotPassword />} />
      <Route path="hotels" element={<Hotels />} />
      <Route path="itinerary" element={<Itinerary />} />
      <Route path="attractions" element={<Attractions />} />
      <Route path="sharedItinerary/:user_id" element={<SharedItinerary />} />
      <Route path="aboutus" element={<AboutUs />} />
      <Route path="accountSettings" element={<AccountSettings />} />

      {/* Protected route for /home */}
      <Route element={<ProtectedRoute />}>
        <Route path="home" element={<Home />} />
      </Route>

      {/* Fallback for unmatched routes */}
      <Route path="*" element={<h1>Page not found</h1>} />
    </Route>
  )
);