import Component from '@ember/component';
import {computed} from '@ember/object';
import Constants from '../constants';

import $ from 'jquery'
import d3 from 'd3';

export default Component.extend({
    /**
     * Required Ember input.  The journal we are reporting on.s
     */
    journal: null,

    show_help: computed('report_data.[]', function() {
        //if there is only 2 records (likely, an uncategorized and a total record)
        //we show the help
        return (this.get('report_data').length == 2);
    }),

    /**
     * The output for generating the report display
     */
    report_data: computed('journal.@each.path_classification', function() {
        let graph = this.totalJournal();
        
        //split hidden groups
        this.splitHiddenGroups(graph.totals);

        //create group total sections of the report
        this.backTotalGroups(graph.totals);

        //transpose into array for rendering
        let result = this.transposeTotalGroups(graph.totals);

        //append the total
        result.push({
            header: "Total",
            value: graph.grandtotal
        });

        //assign colors
        let graphData = this.assignColors(result);

        //now create the graph
        this.createGraph(graphData);

        return result;
    }),

    /**
     * Accumulate records from teh journal into a dictionary of totals
     */
    totalJournal() {
        //we accumulate the totals in a dictionary
        var totals = {};
        var grandtotal = 0;

        //itterate each journal record
        this.get('journal').forEach((record) => {
            let amount = Math.round(record.get('amount'));
            //if the category is not set then we use a default category
            let path_classification = record.get('path_classification') || 'Uncategorized';

            if (path_classification != Constants.JOURNAL_REMOVED_PATH) {
                //the current total for the category
                let currenttotal = totals[path_classification] || 0;

                //do our two additions
                totals[path_classification] = currenttotal + amount;
                grandtotal += amount;
            }
            
        });

        //done!
        return {
            totals: totals,
            grandtotal: grandtotal
        };
    },

    /**
     * D3 integration.  We wait for the UI to be ready before rendering.
     */
    didInsertElement: function() {
        this.workspaceReady = true;

        this.createGraph();
    },

    /**
     * Create a graph based on a graph summary generated from the reporting process
     * @param {} graphSummaryRows Graph level 1 header rows from the report generation process
     */
    createGraph(graphSummaryRows) {
        if (graphSummaryRows) {
            this.workspaceData = graphSummaryRows;
        }
        
        //if the ui isn't ready don't render... didInstertElement will be called later
        if (!this.workspaceReady) {
            return;
        }

        let svg = d3.select("svg");

        //wipe out the graph... lazy :)
        $(svg).html("");
        
        //set the svg control properties
        let width = +svg.attr("width") || 200;
        let height = +svg.attr("height") || 200;
        let radius = Math.min(width, height) / 2;
        let g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        var pie = d3.pie()
            .sort(null)
            .value(function(d) { return d.value; });
            

        var path = d3.arc()
            .outerRadius(radius - 10)
            .innerRadius(0);

        
        var arc = g.selectAll(".arc")
            .data(pie(this.workspaceData))
            .enter().append("g")
            .attr("class", "arc");
        

        arc.append("path")
            .attr("d", path)
            .attr("fill", function(d) { 
                return d.data.color; 
            });
        
    },

    /**
     * If there are any groups that would be hidden by the graph totaling
    * we will split into a "general" group.
     * @param {object} totalSet An accumulated total set
     */
    splitHiddenGroups(totalSet) {
        let hiddenGroups = [];
        let accumulatedMask = {};

        for (let key in totalSet) {
            //if the group is in the mask then we have a "hit"
            let path = key.split('/');

            while (path.length > 1) {
                path.pop();
                let parentkey = path.join("/");

                //optimization:
                //if the key already exists we don't need to go furnther down
                if (accumulatedMask[parentkey]) {
                    break;
                }

                accumulatedMask[parentkey] = true;
            }
        }

        //we have to do this in 2 passes because otherwise the order would matter
        //in this loop we build up the keys to the hidden paths and remove them after
        for (let key in totalSet) {
            if (accumulatedMask[key]) {
                hiddenGroups.push(key);
            }
        }

        //now actually remove all the hidden groups
        for (let index = 0; index < hiddenGroups.length; index++) {
            let current = hiddenGroups[index];
            totalSet[current + "/General"] = totalSet[current];
            delete totalSet[current];
        }
    },

    /**
     * Create all sum groups
     * @param {object} totalSet An accumulated total set
     */
    backTotalGroups(totalSet) {
        let accumulatedcount = 0;
        let source = totalSet;

        do {
            accumulatedcount = 0;
            //all created totals will be stored here then copied to the
            //total set at the end of the loop
            let accumulatedtotals = {};

            for (let key in source) {
                let path = key.split("/");

                //if the path still has more then one piece
                //we can remove one and create a sub path
                if (path.length > 1) {
                    accumulatedcount++;

                    //the "child" we are pulling from
                    let total = source[key];

                    path.pop();
                    
                    //the parent path "key"
                    let groupkey = path.join("/");
                    let grouptotal = accumulatedtotals[groupkey] || 0;
        
                    //add to the parent total
                    accumulatedtotals[groupkey] = grouptotal + total;
                }
            }

            //each itteration the created parent groups become the new source
            source = accumulatedtotals;
            //assign the created totals to the output dictionary
            Object.assign(totalSet, accumulatedtotals);

        } while (accumulatedcount > 0);
    },

    /**
     * Transpose a total set into a sequence array that can be rended
     * @param {object} totalSet An accumulated total set
     */
    transposeTotalGroups(totalSet) {
        let result = [];

        //this is pretty simple... we're converting a dictionary into an array
        for (let key in totalSet) {
            var currenttotal = totalSet[key];

            result.push({
                header: key,
                depth: key.split("/").length,
                value: currenttotal
            });
        }

        //sort
        result.sort((a,b) => {
            let av = a.header + "/zzz";
            let bv = b.header + "/zzz";

            if (av < bv) return -1;
            if (av > bv) return 1;

            return 0;
        });

        return result;
    },

    /**
     * Assign colors to all depth 1 items.
     * @param resultList The result list we are itterating for depth 1 items to assign a color
     */
    assignColors(resultList) {
        let colorindex = 0;
        var assigned = [];

        for (let index = resultList.length - 1; index >= 0; index--) {
            let item = resultList[index];
            if (item.depth == 1) {
                item.color = Constants.COLORS[colorindex];
                colorindex = (colorindex + 1) % Constants.COLORS.length;

                assigned.push(item);
            }
        }

        return assigned;
    }
});
