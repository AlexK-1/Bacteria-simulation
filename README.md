# Bacteria simulation

Simulation of bacteria with the ability to customize the simulation using the *GUI*. As a result of evolution, bacteria change their behavior, size and speed, and the ability to eat food or other bacteria.

## Basic rules

Bacteria move based on the location of *food* (green and yellow dots) and other bacteria. A bacteria has energy that it uses up. When a bacteria encounters food, it receives energy (if it has the ability to do so), and the food disappears. When a bacteria collides with another bacteria, it takes energy from another bacteria (if it has the ability to do so). If the bacteria has no energy left, it dies and leaves *yellow food* in its place.

## Bacteria

Bacteria form the basis of the simulation. A bacteria has age and energy. The age increases with each tick, and when it reaches a certain maximum, the bacteria dies. The energy decreases with each tick, if it is too little, the bacteria dies.

At birth, a bacteria receives a certain amount of energy. A bacteria can gain energy by eating food or *"biting"* another bacteria. How much energy a bacteria gets when it eats food depends on its *herbivore coefficient (c. h.)*. The higher the coefficient, the more energy the bacteria receives when it eats food. How much energy a bacteria takes from another bacteria in a collision depends on the *predation coefficient (c. p.)*. The higher this coefficient, the more energy the bacteria can take away. These two coefficients can be used to determine whether a bacteria is herbivorous, omnivorous, or a predator.

When a bacteria accumulates enough energy, it can create a new bacteria with a similar *genome*. The new bacteria has almost the same genome as its parent, but with a few small changes. There is also a chance of a large *mutation* of the bacteria. This contributes to the creation of new species of bacteria, the *evolution* of bacteria.

The bacteria is controlled by a simple *neural network* with no *hidden layers*. The parameters that the bacteria knows: the direction to the accumulation of food and the coordinates of the nearest food, the direction to the accumulation of less dangerous bacteria and the coordinates of the nearest less predatory bacteria, the direction to the accumulation of bacteria of the same species and the coordinates of the nearest bacteria of the same species, the direction to the accumulation of more dangerous bacteria and the coordinates of the nearest more predatory bacteria, the amount of energy spent. Bacteria can only see food and other bacteria within a certain radius. **Bacteria can only move and take energy from the bacteria that collide with them.**

## Food

The food consists of green and yellow dots scattered all over the world of bacteria. Bacteria can eat food and get energy from it. When a bacteria dies, it leaves yellow food in its place. Green food appears by itself in a certain amount in a certain period of time.

## GUI

The interface consists of two panels: settings and statistics. They can be hidden using the red buttons in the corner of the panels.

### Settings

The settings panel is located on the right side of the screen. There are controls, simulation start settings, bacteria and food settings.

The first group contains the pause and restart buttons for the simulation, as well as the bacteria display mode.

The start settings include the size of the world, the number of bacteria and food that appear at the start of the simulation.

Bacterial settings and their description:
* Max age - the age at which the bacteria dies (measured in ticks)
* Energy usage - how much energy will a bacteria spend in one tick
* Energy on start - how much energy does the bacteria receive at birth
* Viewing radius - the radius in which a bacteria can see food and other bacteria, with a small world size (measured in pixels)
* Energy for reproduction - how much energy does a bacteria lose when it creates a new bacteria
* Speed - the speed of the bacteria
* Delay on start - the amount of time that the bacteria will stay in place after it appears (measured in ticks)
* Mutation chance - the chance that a bacteria can mutate at birth (measured in percentage)
* Mutation size - how many connections in the bacterial neural network will change during mutation
* Energy when bite - how much energy does a predatory bacteria take from another bacteria it has encountered in one tick

Food settings include: how much energy one yellow and green food contains, how much and how often green food will appear.

### Statistics

The statistics panel is also divided into two groups: global statistics and statistics of certain species of bacteria.

The global statistics show the total number of bacteria and food, the percentage of predators and herbivores (only *c. p.* and *c. h.* are counted therefore, even in the absence of obvious predators, the counter will show the presence of predators).

Species statistics show the abilities and abundance of certain species of bacteria. The species are arranged in descending order of the number of bacteria of this species.

## Credits

I got the idea to create this simulation when I watched @ArtemOnigiri 's video about his simulation of similar bacteria.

Also thanks to @GulgDev for his images of bacteria and the image color change code.

## Conclusion

This project is my second with a bacteria simulation project. And this project turned out to be much better than the previous one ([Bacteria simulation zones](https://github.com/AlexK-1/Bacteria-simulation-zones)).

In the future, I'm going to add some new features to this simulation and start doing a new simulation with multicellular organisms.