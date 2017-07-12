angular.module('directive.progress', [])

.directive('uiProgressBar', function($timeout) {
    return {
        restrict: 'EA',
        scope: {
            step: '='
        },
        templateUrl: 'directives/progress/progress.tpl.html',
        link: function(scope, element, attr) {
            $(element).find('.progress-wrapper').html(setHTML(0));

            scope.$watch('step', function(step) {
                var el = $(element).find('span');

                switch(step){
                    case 1: {
                        el = el[0];
                        if($(el).hasClass('first')) {
                            $('.ui-progress-bar').val('50');
                            $(el).addClass('border-change');
                            $(el).nextAll().removeClass('border-change');
                            $('.progress-percent').html("0% Complete");
                        }
                        break;
                    }
                    case 2:{
                        el = el[1];
                        if($(el).hasClass('second')) {
                            $(el).nextAll().removeClass('border-change');
                            $('.ui-progress-bar').val('100');
                            $(el).prevAll().addClass('border-change');
                            $(el).addClass('border-change');
                            $('.progress-percent').html("50% Complete");
                        }
                        break;
                    }
                    case 3:{
                        el = el[2];
                        $('.ui-progress-bar').val('100');
                        if($(el).hasClass('third')) {
                            $(el).addClass('border-change');
                            $(el).prevAll().addClass('border-change');
                            $('.progress-percent').html("100% Complete");
                        }
                        break;
                    }
                }
            });

            function setHTML(complete){
                var html = '';
                html += '<div class="progress-container">';
                html += ' <i class="ui-span-border ui-span-border-first"></i>';
                html += ' <i class="ui-span-border ui-span-border-second"></i>';
                html += ' <i class="ui-span-border ui-span-border-third"></i>';
                html += ' <div class="ui-progress-border"></div>';
                html += ' <progress class="ui-progress-bar" min="1" max="100" value="' + complete + '"></progress>';
                html += ' <span class="first">';
                html += '   <label class="label-step-number">1</label>';
                html += '    <label class="label-step-name label-first">Registration</label>';
                html += ' </span>';
                html += ' <span class="second">';
                html += '   <label class="label-step-number">2</label>';
                html += '   <label class="label-step-name label-second">Health Risk Appraisal</label>';
                html += ' </span>';
                html += ' <span class="third">';
                html += '   <label class="label-step-number">3</label>';
                html += '   <label class="label-step-name label-third">Scheduling</label>';
                html += ' </span>';
                html += ' <p class="progress-percent">0% Complete</p>';
                html += '</div>';

                return html;
            }
        }
    };
});
