## Project Overview

- **Problem Statement:** This project will aim to make identifying species in camera traps easier for wildlife monitoring projects and conservation efforts.

- **Purpose/Goal:** To provide conservation agencies with a website that easily detects and tracks animal activity with AI, removing the need for manual inspection.

- **Vision:** A website used by conservation agencies for free to help wildlife protection.

---

## Scope

1.  **In-Scope:**

    - Website with user accounts.
    - Connection to camera traps for real-time video viewing.
    - Animal and species detection using a ML model.
    - Notification system to alert users of new detections.
    - Saves video clips of detections with metadata (date, time, species).
    - Allows users to review and download saved video clips.
    - (Compatibility) The system will ultimately support industry-standard camera traps, following initial testing with phones and custom Arduino-based cameras.

2.  **Out-of-Scope:**

    - Share/link accounts of people from the same organization.
    - Save all video footage.
    - Allow user to fine-tune markers and video detection.
    - Use public domain AI models.
    - Customize the model to local wildlife.
    - Save sub-divisions of the video manually.
    - Upload videos from computer.

---

## Stakeholders

- **Users:** Wildlife Conservation Agencies, Wildlife Photographers, camera trap owners.

- **Client/Sponsor:** Personal project

- **Project Team:** Myself

---

## Requirements

1. **Functional Requirements:**

- The user **must be able to** create an account with email and password.

- The user **must be able to** log in with an email and password.

- The user **must be able to** delete an account.

- The user **must be able to** change their password via email.

- The user **must be able to** download the video saved.

- The user **must be able** to delete saved videos from account.

- The user **must be able to** view the footage in real-time.

- The user **must receive** and email notification as well as on-website notification.

- The user **must be able** to disable email notifications as well as on-website notifications.

- The user **must be able** to review the video saved in the website.

- The user **must be able** to save at most 25GB of video footage.

- The user **must be able** to connect camera at most 5 camera traps to account.

- The user **must be able** to disconnect camera traps from account.

- The user **must be able** to modify camera trap settings.

- The website **must be able** to receive footage from camera trap.

- The system **must be able** to review footage with the ML model in real time.

- The system **must display** the detected species, date, and time for each saved video clip.

- The system **must display** the user's current storage usage (e.g., "You are using 14.2 GB / 25 GB").

- The system **must stop** saving new clips when a user's limit is reached.

- The system **must display** the user's current camera count (e.g., '3 / 5 cameras used').

- The system **must notify** the user (on-website or by email) when their storage is full.

- The backend **must** install and use the \speciesnet` Python package (google/cameratrapai) as its core ML engine.

2. **Non-Functional Requirements:**

- **Performance:**

  - **Page Load:** All website pages must load in a user's browser in under 2 seconds.
  - **Real-time Stream:** The real-time video stream must begin playing within 5 seconds of the user selecting it.
  - **Detection Speed:** The system must process a detection and send a notification to the user within 60 seconds of the event ending.

- **Usability:**

  - **Responsive Design:** The website must be fully responsive and usable on mobile browsers (Chrome on Android and Safari on iOS).
  - **Camera Setup:** A new user must be able to add their first camera trap in 4 steps or less.
  - **Accessibility:** The website must meet basic WCAG 2.1 AA accessibility standards (e.g., color contrast, keyboard navigation).

- **Security:**

  - **Password Storage:** All user passwords must be securely hashed and never stored as plain text.
  - **Data Transmission:** All communication (website, API, video streams) must be encrypted using HTTPS/SSL.
  - **Video Privacy:** Saved video clips for an account must be private and only viewable by the logged-in user of that account.

- **Reliability:**

  - **Uptime:** The system will aim for 99.9% uptime.
  - **Data Integrity:** The system must ensure that no saved detection clips are lost or corrupted once successfully uploaded to object storage.

3. **Technical Requirements:**

- **Frontend:** The web application **will be developed** using **React**.

- **Backend:** The backend API **will be developed** using **Python**.

- **Database:** The system **will use** a **PostgreSQL** database.

- **ML Model:** The ML model **will be** google cameratrapai.

- **Hosting & Services:**

      -   **Frontend Hosting:** The React application **will be hosted** on **Vercel** or **Netlify**.

      -   **Backend Hosting:** The Python backend API **will be hosted** on **Render**.

      -   **Database Hosting:** The PostgreSQL database **will be hosted** on **Render**.

      -   **Video Storage:** All saved video clips **will be stored** in an object storage service like **Cloudflare R2** or **Backblaze B2**.

---

## Constraints & Assumptions

- **Constraints:**

  - **Time:** An MVP **must be** completed within **3 months**.
  - **Budget:** The project **must** operate on a total monthly budget of **less than $20/month** for all hosting, database, and video storage costs.
  - **Resources:** The project is limited to a **single developer** (myself) responsible for all frontend, backend, database, and deployment tasks.

- **Assumptions:**
  - The 'free' and 'hobby' tiers of Vercel and Render will provide sufficient performance and reliability for the initial version of the application.
  - Industry-standard camera traps can provide a real-time video stream that the Python backend can access.
  - The chosen object storage services (Cloudflare R2 / Backblaze B2) will be consistently cheaper than AWS S3 or Azure Blob Storage.
  - The Python backend can capture snapshots or short clips from the real-time video stream and feed them to the \speciesnet package (e.g., as temporary files) for processing.
  - This entire workflow is possible and can be completed within the 60-second 'Detection Speed' requirement.

---

## Acceptance Criteria

- **User Account Management:** (Create Account, Login, Password Reset, Delete Account)

  - **Create Account (Happy Path):**

    - **Given:** A user provides a valid, unique email and a strong password.
    - **When:** They click "Sign Up".
    - **Then:** Their account is created, they are logged in, and they are redirected to their dashboard.

  - **Create Account (Sad Path):**

    - **Given:** A user provides an email that _already exists_ in the database.
    - **When:** They click "Sign Up".
    - **Then:** They see an error message: "This email is already in use."

  - **Login (Happy Path):**

    - **Given:** A user has an existing account.
    - **When:** They enter their correct email and password.
    - **Then:** They are logged in and redirected to their dashboard.

  - **Login (Sad Path):**

  - **Given:** A user has an existing account.
  - **When:** They enter an _incorrect_ password.
  - **Then:** They see an error message: "Invalid email or password."

  - **Password Reset:**

    - **Given:** A user clicks the "Forgot Password" link.
    - **When:** They enter their valid email address and submit.
    - **Then:** They receive an email with a unique password reset link.

  - **Delete Account:**

    - **Given:** A logged-in user navigates to their "Account Settings" page.
    - **When:** They click the "Delete Account" button and confirm the action (e.g., by re-entering their password).
    - **Then:** Their account and all associated data (cameras, saved videos, etc.) are permanently deleted from the database.

- **Camera Trap Management:** (Connecting a new camera, Disconnecting a camera, Modifying settings, 5-camera limit)

  - **Connect Camera (Happy Path):**

    - **Given:** A user is logged in and has 4 cameras connected.
    - **When:** They navigate to "Add Camera" and enter a valid name and stream URL.
    - **Then:** The new camera is added to their account, the dashboard shows "5 / 5 cameras used", and they are returned to the dashboard.

  - **Connect Camera (Sad Path - Limit):**

    - **Given:** A user is logged in and has 5 cameras connected.
    - **When:** They navigate to the "Add Camera" page.
    - **Then:** They see a message: "You have reached your 5-camera limit. Please disconnect a camera to add a new one." The "Add" button may be disabled.

  - **Connect Camera (Sad Path - Invalid URL):**

    - **Given:** A user is logged in.
    - **When:** They try to add a camera with an invalid or unreachable stream URL.
    - **Then:** The camera is **not** added, and an error message appears: "Could not connect to the stream. Please check the URL and camera status."

  - **Disconnect Camera:**

    - **Given:** A user is on their dashboard viewing their list of 5 cameras.
    - **When:** They select "Camera 3" and click the "Delete" or "Disconnect" button.
    - **Then:** "Camera 3" is removed from their account, and the dashboard updates to show "4 / 5 cameras used."

  - **Modify Settings:**

    - **Given:** A user is viewing the settings for "Camera 1".
    - **When:** They change the camera's name from "Camera 1" to "Backyard Cam" and click "Save".
    - **Then:** The settings are saved, and the camera is now named "Backyard Cam" on their dashboard.

- **Real-time Video Streaming:** (Receiving the stream, Viewing the stream on the website)

  - **View Stream (Happy Path):**

    - **Given:** A user is logged in and has a valid, online camera.
    - **When:** They click the "View Live" button for that camera.
    - **Then:** The real-time video stream appears and begins playing within 5 seconds (as per the NFR).

  - **View Stream (Sad Path - Camera Offline):**

    - **Given:** A user is logged in.
    - **When:** They click "View Live" for a camera that is offline or unreachable.
    - **Then:** A placeholder image or loading spinner appears, followed by an error message: "Camera is offline or not responding."

- **ML Species Detection:** (Running the `speciesnet` model, Processing the video, Displaying the results with metadata)

  - **Run Detection (Happy Path):**

    - **Given:** A connected camera's stream is being processed by the backend.
    - **When:** The `speciesnet` package identifies one of the target species (e.g., "Black bear").
    - **Then:** A new "Detection" record is created in the database, linking the user, the species, the date/time, and the saved video clip.

  - **Run Detection (No Detection):**

    - **Given:** A connected camera's stream is being processed.
    - **When:** The `speciesnet` package processes a clip but finds no animals (or only finds non-target species).
    - **Then:** No "Detection" record is created, and no notification is sent.

  - **Display Results:**

    - **Given:** A user is logged in and navigates to their "Detections" page.
    - **When:** The page loads.
    - **Then:** The user sees a list of their saved clips, and each clip clearly displays the species name (e.g., "Grizzly Bear"), the camera name ("Backyard Cam"), and the detection date and time.

- **Saved Video Management:** (Reviewing saved clips, Downloading clips, Deleting clips)

  - **Review Clip:**

    - **Given:** A user is on their "Detections" page.
    - **When:** They click the "Play" button on a saved detection clip.
    - **Then:** The video clip plays directly in the web browser.

  - **Download Clip:**

    - **Given:** A user is reviewing a saved clip.
    - **When:** They click the "Download" button.
    - **Then:** The video file (e.g., `detection-2025-09-16T17-30-00.mp4`) is downloaded to their device.

  - **Delete Clip:**
    - **Given:** A user is on their "Detections" page and has 14.2 GB of storage used.
    - **When:** They select a 200MB clip, click "Delete", and confirm the action.
    - **Then:** The clip is permanently deleted, and their "storage used" display updates to 14.0 GB.

- **Storage Limit & Management:** (25GB cap, Stopping new saves when full, Displaying current usage)

  - **Display Usage:**

    - **Given:** A user is logged in and has used 14.2 GB of storage.
    - **When:** They view their dashboard or account settings.
    - **Then:** They see a clear visual indicator: "Storage: 14.2 GB / 25 GB used."

  - **Save Clip (At Limit):**

    - **Given:** A user is at 24.9 GB of their 25GB limit.
    - **When:** A new 200MB clip is detected.
    - **Then:** The new video clip is **not** saved.
    - **And:** The user receives an "on-website" notification that their storage is full.
    - **And:** The user receives an "email" notification that their storage is full (if enabled).
    - **And:** The "storage used" display remains at 24.9 GB.

- **Notification System:** (On-website and email notifications for detections/storage, Allowing the user to disable them)

  - **Receive Notifications (Happy Path):**

    - **Given:** A user has both "on-website" and "email" notifications enabled.
    - **When:** A new animal is detected.
    - **Then:** The user receives an "on-website" notification (e.g., a "bell" icon with a red dot).
    - **And:** The user receives an email with the detection details (e.g., "Grizzly Bear detected at Backyard Cam").

  - **Disable Email Notifications:**

    - **Given:** A user is in their "Account Settings" page.
    - **When:** They uncheck the "Enable Email Notifications" box and click "Save".
    - **Then:** They no longer receive emails for new detections.

  - **Receive Notifications (Email Disabled):**

    - **Given:** A user has _disabled_ email notifications but _enabled_ on-website notifications.
    - **When:** A new animal is detected.
    - **Then:** The user receives the "on-website" notification, but **no** email is sent.
