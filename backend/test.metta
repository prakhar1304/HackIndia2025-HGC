; final/logic.metta
; Dynamic users space + imported movies DB. Content and collaborative recommendations.
; Usage: load this file in Python via hyperon.MeTTa and call functions.

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
; Spaces and imports
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

;!(bind! &users (new-space))

; movies DB binds &movies internally and populates it
; !(import! &self movies_db)
;!(match &movies $x $x)


; at the very top of backend/logic.metta
;!(register-module! ./backend)
;!(import! &self backend:movies_db)


; Register current directory as 'backend' module
; !(register-module! .)

; Import movies_db from current directory
!(import! &self movies_db)
!(import! &self user)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
; Helpers
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

; not watched and not disliked guards
(= (not-watched $u $m)
    (if (match &users (watched $u $m) True) ()
        (if (match &users (dislike $u $m) True) () $m)))

; map imdb id <-> movie id
(= (m-of-imdb $imdb $m) (match &movies (imdb-id $m $imdb) $m))
(= (imdb-of-m $m $imdb) (match &movies (imdb-id $m $imdb) $imdb))

; convenience getters for user facts
(= (user-genres $u) (match &users (fav-genre $u $g) $g))
(= (user-actors $u) (match &users (fav-actor $u $a) $a))
(= (user-directors $u) (match &users (fav-director $u $d) $d))
(= (user-languages $u) (match &users (language $u $l) $l))
(= (user-countries $u) (match &users (country $u $c) $c))
(= (user-writers $u) (match &users (writer $u $w) $w))
(= (user-liked $u) (match &users (liked $u $m) $m))
(= (user-watched $u) (match &users (watched $u $m) $m))
(= (users-all) (match &users (user $u) $u))


;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
; Content-based recommendation (two-step: candidates, then filter)
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

; 1 Candidate generation (no filters)
(= (content-any $u $m )
    (match &users (fav-genre $u $g)
        (match &movies (has-genre $m $g) $m)))

(= (content-any $u $m)
    (match &users (fav-actor $u $a)
        (match &movies (has-actor $m $a) $m)))

(= (content-any $u $m)
    (match &users (fav-director $u $d)
        (match &movies (has-director $m $d) $m)))

(= (content-any $u $m)
    (match &users (language $u $l)
        (match &movies (language $m $l) $m)))

(= (content-any $u $m)
    (match &users (country $u $c)
        (match &movies (country $m $c) $m)))

(= (content-any $u $m)
    (match &users (writer $u $w)
        (match &movies (writer $m $w) $m)))

; similarity to liked items
(= (content-any $u $m)
    (match &users (liked $u $m2)
        (match &movies (has-genre $m2 $g2)
            (match &movies (has-genre $m $g2) $m))))

(= (content-any $u $m)
    (match &users (liked $u $m2)
        (match &movies (has-actor $m2 $a2)
            (match &movies (has-actor $m $a2) $m))))

(= (content-any $u $m)
    (match &users (liked $u $m2)
        (match &movies (has-director $m2 $d2)
            (match &movies (has-director $m $d2) $m))))

; (= (content-any $u $m)
;     (match &users (liked $u $m2)
;         (match &movies (language $m2 $l2)
;             (match &movies (language $m $l2) $m))))

; (= (content-any $u $m)
;     (match &users (liked $u $m2)
;         (match &movies (country $m2 $c2)
;             (match &movies (country $m $c2) $m))))

; 2. Final recommendation: apply filters to candidates
(= (rec-content $u $m)
    (match &self (content-any $u $m)
    $m))

; Minimal baseline to validate signal flow (no filters)
(= (rec-content-min $u $m)
    (match &users (fav-genre $u $g)
        (match &movies (has-genre $m $g) $m)))

(= (rec-content-min $u $m)
    (match &users (fav-actor $u $a)
        (match &movies (has-actor $m $a) $m)))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
; Collaborative filtering across users
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

; users similar if share liked or any preference
(= (similar-users $u $v)
    (if (== $u $v) ()
        (match &users (liked $u $i) (match &users (liked $v $i) True))))

(= (similar-users $u $v)
    (if (== $u $v) ()
        (match &users (fav-genre $u $g) (match &users (fav-genre $v $g) True))))

(= (similar-users $u $v)
    (if (== $u $v) ()
        (match &users (fav-actor $u $a) (match &users (fav-actor $v $a) True))))

(= (similar-users $u $v)
    (if (== $u $v) ()
        (match &users (fav-director $u $d) (match &users (fav-director $v $d) True))))

(= (similar-users $u $v)
    (if (== $u $v) ()
        (match &users (language $u $l) (match &users (language $v $l) True))))

(= (similar-users $u $v)
    (if (== $u $v) ()
        (match &users (country $u $c) (match &users (country $v $c) True))))

; recommend items liked by similar users
(= (rec-collab $u $m)
    (match &self (similar-users $u $v)
        (match &users (liked $v $m) (not-watched $u $m))))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
; Similar users list (emit $v) — union of similarity signals
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(= (similar-users-list $u $v)
    (match &users (liked $u $i) (match &users (liked $v $i) $v)))

(= (similar-users-list $u $v)
    (match &users (fav-genre $u $g) (match &users (fav-genre $v $g) $v)))

(= (similar-users-list $u $v)
    (match &users (fav-actor $u $a) (match &users (fav-actor $v $a) $v)))

(= (similar-users-list $u $v)
    (match &users (fav-director $u $d) (match &users (fav-director $v $d) $v)))

(= (similar-users-list $u $v)
    (match &users (language $u $l) (match &users (language $v $l) $v)))

(= (similar-users-list $u $v)
    (match &users (country $u $c) (match &users (country $v $c) $v)))


;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
; Search helpers (contextual fields are in &movies)
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

; search by besttime-to-watch and/or watch-type (both optional)
(= (search-context $best $type $m)
    (if (== $best ())
        (match &movies (watch-type $m $type) $m)
        (if (== $type ())
            (match &movies (besttime-to-watch $m $best) $m)
            (match &movies (besttime-to-watch $m $best)
                (match &movies (watch-type $m $type) $m)))))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
; User detail helpers
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(= (user-fact $u $f)
    (match &users ($rel $u $x) ($rel $u $x)))


;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
; Debug-friendly, rs.metta-like stepwise functions with let and trace
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

; genre-driven candidates with in-between trace
(= (genre_based_recommendation $u)
    (let $g (match &self (fav-genre $u $x) $x)
        (trace! (fav-genre-of $u $g)
            (match &movies (has-genre $m $g) $m))))

; actor-driven
(= (actor_based_recommendation $u)
    (let $a (match &self (fav-actor $u $x) $x)
        (trace! (fav-actor-of $u $a)
            (match &movies (has-actor $m $a) $m))))

; director-driven
(= (director_based_recommendation $u)
    (let $d (match &self (fav-director $u $x) $x)
        (trace! (fav-director-of $u $d)
            (match &movies (has-director $m $d) $m))))

; country-driven (user country → movie country)
(= (country_based_recommendation $u)
    (let $c (match &self (country $u $x) $x)
        (trace! (country-of $u $c)
            (match &movies (country $m $c) $m))))

; language-driven
(= (language_based_recommendation $u)
    (let $l (match &self (language $u $x) $x)
        (trace! (language-of $u $l)
            (match &movies (language $m $l) $m))))

; combine the above, then filter via not-watched
(= (content_debug $u $m)
    (match &self (genre_based_recommendation $u) (not-watched $u $m)))
(= (content_debug $u $m)
    (match &self (actor_based_recommendation $u) (not-watched $u $m)))
(= (content_debug $u $m)
    (match &self (director_based_recommendation $u) (not-watched $u $m)))
(= (content_debug $u $m)
    (match &self (country_based_recommendation $u) (not-watched $u $m)))
(= (content_debug $u $m)
    (match &self (language_based_recommendation $u) (not-watched $u $m)))

; !(trace! (debug content bob) (match &self (content_debug bob $m) $m))




(= (fill-l2 $u)
   (match &movies (movie $m)
     (let*
       (
        ;  ($g (match &self (fav-genre $u $g) $g))
        ;  ($_ (match &movies (has-genre $m $g) True))

         ($_ (if (match &users (fav-genre $u $a)
                (match &movies (has-genre $m $a) True))
                True
                (match &movies (movie __never__) True)))


         ($_ (if (match &users (language $u $a)
                (match &movies (language $m $a) True))
                True
                (match &movies (movie __never__) True)))

                
        ;  ($l (match &self (language  $u $l) $l))
        ;  ($_ (match &movies (language $m $l) True))

        ($_ (if (match &self (fav-actor $u $a)
                (match &movies (has-actor $m $a) True))
                True
                (match &movies (movie __never__) True)))

        ($_ (if (match &self (fav-actor $u $a)
                (match &movies (has-actor $m $a) True))
                True
                (match &movies (movie __never__) True)))

         ($r (match &movies (imdb-rating $m $r) $r))
         ($_ (if (> $r 8)
                 True
                 (match &movies (movie __never__) True)))
       )
       $m)))

; !(fill-l2 bob) 



; Pass if there exists a common favorite genre
(= (exists-common-genre $u $v)
   (match &users (fav-genre $u $g)
     (match &users (fav-genre $v $g) True)))

; Pass if there exists a common watched title
(= (exists-common-watched $u $v)
   (match &users (watched $u $m)
     (match &users (watched $v $m) True)))

; Pass if there exists a common liked title
(= (exists-common-liked $u $v)
   (match &users (liked $u $m)
     (match &users (liked $v $m) True)))

; Minimal similarity: genre overlap AND (watched OR liked) overlap
(= (similar-user-min $u $v)
   (let*
     (
       ; require at least one common genre
       ($_ (if (exists-common-genre $u $v)
               True
               (match &users (user __never__) True)))

       ; require watched OR liked overlap
       ($_ (if (exists-common-watched $u $v)
               True
               (if (exists-common-liked $u $v)
                   True
                   (match &users (user __never__) True))))
     )
     $v))

; Enumerate similar users for $u (exclude self if desired)
(= (find-similar-users $u)
   (match &users (user $v)
     (let*
       (
         ; optional: drop same user
         ($_ (if (== $u $v)
                 (match &users (user __never__) True)
                 True))
       )
       (similar-user-min $u $v))))



 ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
 ;collaborative  search     
 ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;; 


(= (get-unwatched-movies-from-others $current_user)
   (match &users (user $other_user)
       (if (== $current_user $other_user)
           ()  ; Skip current user
           (match &users (watched $other_user $movie) 
               (match &self (not-watched $current_user $movie) $movie)))))  ; Only return unwatched movies

(= (get-movies-from-other-users-check $current_user)
   (match &users (user $other_user)
       (if (== $current_user $other_user)
           ()  ; Skip current user
           (match &users (watched $other_user $movie) $movie)
           )))  ; Get their movies               

; (= (not-watched $c $m )
;    (match &users (watched  $c $cm)  
;                  (if (== $cm $m)
;                      (trace! ("user-has-watched" $c $m  $cm) ())
;                      (trace! ("user-has-not-watched" $c $m $cm ) ($m))
;                   )
;    )
; )


(= (not-watched $c $m )
   (match &users (watched  $c $cm)  
                 (if (== $cm $m)
                      ()
                      ($m)
                  )
   )
)

(= (collaborative-search $u)
    (let $x  (get-movies-from-other-users-check $u) (not-watched $u $x)) 
)

; !(collaborative-search pinky)





(= (movie-twin-u1 $u1)
    (match &users (watched $u1 $m) $m)
)


(= (movie-twin-u2 $u2)
    (match &users (watched $u2 $m) $m)
)



!(movie-twin-u2 pinky)
!(movie-twin-u2 raj)