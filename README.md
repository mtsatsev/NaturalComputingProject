# NaturalComputingProject
The code and pdf of our project for Natural Computing At Radboud University

# Manual
1. Paste the script found in `sketch_script.js` in the p5.js [studio](https://editor.p5js.org/) or run it locally. 
2. Adjust the top parameters as desired. To reproduce the experiments from the paper you need to vary the parameters:
    * `FoodCoolDown`
    * `N_food`
    * The name of the file that you want to save as in `WriteResults` `saveJSON(weights, "FoodCoolDown10/Run" + G.toString() + '/results.json');`. Note this is a code which runs on the web and it has no knowledge of local directories etc. The final output will be written to a file.
3. The result is downloaded as `.json` file. We ran the experiments 10 times so run it as well at least some times and then place them all in a folder. 
4. Open the notebook called `Data_analysis.ipynb`. Only change these lines:

```python
results = read_and_average('experiments/Food40Cooldown',names,30,15)
visualize(results, 'results')
```


## NOTE:
1. The code here also has an implementation for Tournament K selection which we ended up not using.