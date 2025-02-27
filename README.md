# SpaceToStudy-BackEnd

[![Build Status](https://dev.azure.com/ProjectApproach/Space2Study/_apis/build/status/ita-social-projects.SpaceToStudy-BackEnd?branchName=develop)](https://dev.azure.com/ProjectApproach/Space2Study/_build/latest?definitionId=32&branchName=develop)

## About the Project

**SpaceToStudy** is a platform designed to facilitate interaction between students and tutors. This repository contains the backend of the application, providing APIs for user management, session handling, reviews, and more.

## Features

- **User Management**: Registration, authentication, and authorization.
- **Reviews & Ratings**: Users can leave feedback and rate tutors and students.
- **Notifications**: System for alerts about upcoming sessions and events.

## Technologies Used

- **Node.js** – JavaScript runtime environment.
- **Express.js** – Web framework for building APIs.
- **MongoDB** – NoSQL database for storing data.
- **Mongoose** – ORM for MongoDB.
- **JWT** – JSON Web Tokens for authentication and authorization.

## Installation & Setup

1. **Clone the repository**:

   ```bash
   git clone https://github.com/ita-social-projects/SpaceToStudy-BackEnd.git
   ```

2. **Navigate to the project directory**:

   ```bash
   cd SpaceToStudy-BackEnd
   ```

3. **Install dependencies**:

   ```bash
   npm install
   ```

4. **Set up environment variables**:

   Copy the `.env.example` file to `.env` and configure the required environment variables.

5. **Run the application**:

   ```bash
   npm start
   ```

   The application will be available at `http://localhost:3000`.

## Testing

To run tests, use the following command:

```bash
npm test
```

This will execute all defined tests and display the results in the console.

## Contributing

We welcome contributions from the community. Please refer to [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to get involved.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Contact

If you have any questions or suggestions, please open an issue in this repository or contact us at **space2study.info@gmail.com**.
