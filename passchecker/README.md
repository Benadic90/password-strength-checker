# Password Strength Checker

A real-time, browser-based password strength checker with detailed feedback,
strength visualization, an optional breach check, and a strong password generator.

## Features
- Real-time password strength evaluation (`Weak` -> `Very Strong`)
- Color-coded strength meter with live updates
- Criteria checklist with pass/fail indicators
- Password visibility toggle with eye icon
- Random secure password generator with customizable options
- Optional Have I Been Pwned breach check using k-anonymity
- Beginner-friendly, modular JavaScript architecture

## Project Structure
```text
password-strength-checker/
|
|-- index.html
|-- README.md
|-- LICENSE
|
|-- css/
|   |-- style.css
|
|-- js/
|   |-- main.js
|   |-- checker.js
|   |-- generator.js
|   |-- ui.js
|   |-- breach.js
|
|-- assets/
|   |-- icons/
|       |-- eye-open.svg
|       |-- eye-closed.svg
|       |-- refresh.svg
|       |-- copy.svg
|       |-- lock.svg
|
|-- tests/
|   |-- checker.test.js
|   |-- generator.test.js
```

## How to Run
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/password-strength-checker.git
   ```
2. Open `index.html` in your browser.

No build step is required.

## Run Tests
From the project root:
```bash
node tests/checker.test.js
node tests/generator.test.js
```

## Contributing
1. Fork the repository.
2. Create a branch:
   ```bash
   git checkout -b feature/your-feature
   ```
3. Commit with a clear message:
   ```bash
   git commit -m "Add: feature description"
   ```
4. Open a Pull Request.

## Security Notes
- This tool evaluates password quality heuristically and does not guarantee absolute security.
- The breach check sends only a 5-character SHA-1 prefix to the API (k-anonymity model).
- No password data is logged to the console.

## License
MIT License. See `LICENSE` for details.
