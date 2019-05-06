const $ = require('jquery');
// JS is equivalent to the normal "bootstrap" package
// no need to set this to a variable, just require it
require('bootstrap');
require('holderjs');
require('./jquery.stoc.smals.js');

require('ab-datepicker/js/locales/fr-BE.min.js');
//require('ab-datepicker/js/locales/nl-BE.min.js');
//require('ab-datepicker/js/locales/de-BE.min.js');
require('./ab-datepicker.smals.js');

require('awesomplete');
//require('./jquery-accessible-autocomplete-list-aria.smals.js');

const enquire = require('enquire.js');

import {} from 'emsch';

const $carousel = $('.carousel');
const $pauseBtn = $('.carousel-pause');
const $pauseText = $pauseBtn.text();
const $playText = $pauseBtn.attr('data-alt');

const $allH2 = $('#content').find('h2').length;

const $active = $('.filters-active');
const $filters = $('.filters');
const $filterCol = $('.search-results > .row > .col-lg-4');
const $mobileFilters = $('#mobile-filters');
const $mobileActive = $('.search-header');

$(function() {
  global.init();
});


const global = {
  init: function() {
    navbar.init();
    carousel.init();
    if ($allH2 > 1 && $('#toc').length) {
      toc.init();
    }
    daterange.init();
    search.init();
    searchFilters.init();
  }
};

const navbar = {
  init: function() {
    this.autoclose();
    this.multipleDropdown();
  },
  autoclose: function() {
    // hide collapse nav when click outside
    $(document).click(function (event) {
      let clickover = $(event.target).parents();
      if(!clickover.hasClass("navbar")) {
        navbar.hideShown();
      }
    });
    // hide other collapse when one is shown
    $('[data-group="mobile-nav"]').on('click',function() {
      navbar.hideShown();
    });
  },
  hideShown: function() {
    $('.navbar-collapse.collapse.show').collapse('hide');
  },
  multipleDropdown: function() {
    $( '.dropdown-menu a.dropdown-toggle' ).on( 'click', function ( e ) {
      let $el = $( this );
      let $parent = $el.offsetParent( ".dropdown-menu" );
      let $subMenu = $el.next( ".dropdown-menu" );

      $el.toggleClass('active-dropdown');
      if ( !$subMenu.hasClass( 'show' ) ) {
        $( this ).parents( '.dropdown-menu' ).first().find( '.show' ).removeClass( "show" );
      }
      $subMenu.toggleClass( 'show' );
      $el.parent( "li" ).toggleClass( 'show' );
      $el.parents( 'li.nav-item.dropdown.show' ).on( 'hidden.bs.dropdown', function ( e ) {
          $( '.dropdown-menu .show' ).removeClass( "show dropdown-menu-right" );
          $el.removeClass('active-dropdown');
      } );
      if (!$parent.parent().hasClass('navbar-nav')) {
        let $boundaries = $el.parents('.container').innerWidth();
        // get total
        let menuOffset = utils.offset($el[0]);
        let menuLeft = menuOffset.left;
        let menuWidth = $el.outerWidth();
        let submenuWidth = $subMenu.outerWidth();
        let totalPosition = menuLeft + menuWidth + submenuWidth;
        // console.log('left: '+ menuLeft +'men width: '+ menuWidth +' width: '+ submenuWidth);
        // console.log('total: '+ (totalPosition));
        // console.log('$boundaries:'+ $boundaries);

        if (totalPosition > $boundaries) {
          $subMenu.addClass('dropdown-menu-right').find('.dropdown-menu');
        }
        if ($subMenu.hasClass('dropdown-menu-right')) {
          $subMenu.removeAttr('style').css({ "top": $el[0].offsetTop, "right": $parent.outerWidth()  });
        } else {
          $subMenu.removeAttr('style').css({ "top": $el[0].offsetTop, "left": $parent.outerWidth()  });
        }
      }
      return false;
    });
  }
};

const carousel = {
  init: function() {
    $carousel.carousel({
      interval: 5000,
      pause: false
    });
    this.pauseBtn();
  },
  pauseBtn: function() {
    $pauseBtn.on('click',function(e) {
      e.preventDefault();
      let $this = $(this);
      if($this.hasClass('active')) {
        $this.removeClass('active').text($pauseText);
        $carousel.carousel('cycle');
      } else {
        $this.addClass('active').text($playText);
        $carousel.carousel('pause');
      }
    });
  }
};

const toc = {
  init: function() {
    $('#toc').stoc({
      search: "#content",
      depth: 2,
      start: 2,
      stocTitle: '',
      children: false,
      justInk: true,
    });
    this.scroll();
  },
  scroll: function() {
    $('#toc a').on('click', function(e) {
      let $target = $(this.hash);
      let target = this.hash;
      let targetOffset = $target.offset().top;
      e.preventDefault();
      $("body, html").animate({
        //scrollTop: targetOffset - (100 + $mainNav.outerHeight() + $appName.outerHeight())
        scrollTop: targetOffset
      }, 400, function() {
        window.location.hash = target;
      })
    });
  }
};

const daterange = {
  init: function() {
    const calendarStart = $('#datepicker-calendar-date_start');
    const calendarEnd = $('#datepicker-calendar-date_end');
    $('#date_start').datepicker({
      firstDayOfWeek: 1,
      outputFormat: 'dd-MM-yyyy',
      theme: 'bootstrap',
      gainFocusOnConstruction: false,
      next: '#date_end' // The date in '#startdate' must be before or equal to the date in '#enddate'
    });
    $('#date_end').datepicker({
      firstDayOfWeek: 1,
      outputFormat: 'dd-MM-yyyy',
      theme: 'bootstrap',
      gainFocusOnConstruction: false,
      previous: '#date_start' // The date in '#enddate' must be after or equal to the date in '#startdate'
    });
  }
};

const search = {
  init: function() {
    this.checkboxesMore();
    enquire.register("screen and (max-width: 991.98px)", {
        match : function() {
          search.filtersMobile();
        },
        unmatch : function() {
          search.filtersDesktop();
        }
    });
  },
  filtersMobile: function() {
    $filters.detach();
    $active.detach();
    $mobileFilters.append($filters);
    $mobileActive.append($active);
  },
  filtersDesktop: function() {
    $filterCol.append($active).append($filters);
  },
  checkboxesMore: function() {
    const $collapseLink = $filters.find('.form-group [data-toggle="collapse"]');
    $collapseLink.each(function() {
      const $this = $(this);
      const $textMore = $this.text();
      const $textLess = $this.attr('data-text');

      $this.on('click',function() {
        const $target = $this.attr('href');
        const $targetInput = $($target+' .custom-checkbox:first-child input');
        if ( $this.hasClass('collapsed') ) {
          $this.text($textLess).attr('data-text',$textMore);
        } else {
          $this.text($textMore).attr('data-text',$textLess);
        }
        $($target).on('shown.bs.collapse', function () {
          $targetInput.focus();
        });
      });
    });
  }
}

const searchFilters = {
    init: function () {
        this.selectLegislature();
        this.autocompleteKeyword();
    },
    selectLegislature: function () {
        $("select#legislature").change(function() {
            $('input#date_start').val($(this).find(':selected').data("date-start"));
            $('input#date_end').val($(this).find(':selected').data("date-end"));
        });
    },
    autocompleteKeyword: function () {
        let input = document.getElementById('ajax-keyword');

        if (typeof(input) == 'undefined' || input == null) {
            return;
        }

        let awesome = new Awesomplete(input, {
            replace: function(suggestion) {
              let filter = $(this.input).data('filter');
              $('input[name='+filter+']').val(suggestion.value);
              this.input.value = suggestion.label;
            }
        });

        $('input#ajax-keyword').on("input", function() {
            $.ajax({
                'method': 'GET',
                'url': '/ajax/keywords',
                'data': {'q': this.value},
                'dataType': 'json'
            }).done(function (data) {
                awesome.list=data;
            });
        });
    }
};

const utils = {
  offset: function(el) {
    // element offset position relative to window
    var rect = el.getBoundingClientRect(),
    scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
    scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return { top: rect.top + scrollTop, left: rect.left + scrollLeft }
  }
};
