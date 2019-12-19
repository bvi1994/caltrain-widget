import React, {Component} from 'react';
import parse from 'html-react-parser';
import {
    Accordion,
    AccordionItem,
    AccordionItemHeading,
    AccordionItemButton,
    AccordionItemPanel,
} from 'react-accessible-accordion';

import 'react-accessible-accordion/dist/fancy-example.css';
import './styles.css'

class FAQComponent extends Component {
  render(){
    const FAQ = [
      {
        question: `Who create this application?`,
        answer: `This application is created by ${`<a href='https://www.linkedin.com/in/bvi1994/'> Brandon Vi</a>`}. Check him out and he is available for hire. ;)`,
      },
      {
        question: `Do you have the source code for the this application? I have ways to make it better!`,
        answer: `Great! The code can be found <a href='https://github.com/bvi1994/caltrain-widget'>here!</a> I will have a set up guide in the next version of the application.`,
      },
      {
        question: `What are some of the features you will be working on for the next version?`,
        answer: `Real time integration with the 511.org, automatically going to the closest trip time based on current time, better code doocumentation on the README for developers, notifcation of caltrain problems, just to name a few...`
      },
      {
        question: `There's a bug on your application! Where do I submit bug reports?`,
        answer: `You can send me an email to brandvi1994 [at] gmail (dot) com, describe the bug and I will get to it.`
      },
      {
        question: `What else should I know?`,
        answer: `This application is not developed by Caltrain. This is a free service being managed by a geek in his dwindling spare time. It’s provided “as-is” and there are no guarantees (expressed or implied).`
      },
    ];
    return(
      <div className={`dropdownFAQ`}>
        <Accordion>
        {FAQ.map(question =>
          <AccordionItem>
            <AccordionItemHeading>
              <AccordionItemButton>
                {parse(question.question)}
                </AccordionItemButton>
                </AccordionItemHeading>
                <AccordionItemPanel>
                <p align='left'>
                  {parse(question.answer)}
                </p>
              </AccordionItemPanel>
            </AccordionItem>
        )}
        </Accordion>
      </div>
    )
  }
}

export default FAQComponent;
