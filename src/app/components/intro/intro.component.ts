import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'intro',
    templateUrl: './intro.component.html',
    styleUrls: ['./intro.component.css']
})
export class IntroComponent {
    constructor(private router: Router) {
        setTimeout(() => {
            router.navigate([""]);
        }, 6700);
    }
}