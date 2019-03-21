# DeepSeaBio

The website is designed to present data about deep sea biology in a clean and professional way.

Javascript functionality:
- Ajax in finding top articles with keywords (deep sea) in the past month, sorted by popularity

This project was created to help a student present their Independant CE Project.

You can find the website at the following link!

https://nivabecassis.github.io/DeepSeaBio/index.html


## To-do

[x] Fix the bug relating to the expiry date of the key
    - Didn't take into consideration that February is less than 30 days
    - Fix: Get the Date object of the previous month and request the number of days for that month specifically
[ ] Clone html template instead of creating new structure in JS every time